#!/bin/bash

cidr=$1
availability_region=$2
subnet1Cidr=$3
subnet2Cidr=$4
subnet3Cidr=$5

#Checking if valid parameter is passed
if [ -z "$1" ]
then 
	echo "Please enter CIDR"
	echo "Format should be in sequence : 'VPC-CIDR' 'AVAILABILITY_REGION' 'SUBNET1_CIDR' 'SUBNET2_CIDR' 'SUBNET3_CIDR'"
	exit 1
else
	if [ -z "$2" ]
	then 
		echo "Please enter Region"
		echo "Format should be in sequence : 'VPC-CIDR' 'AVAILABILITY_REGION' 'SUBNET1_CIDR' 'SUBNET2_CIDR' 'SUBNET3_CIDR'"
		exit 1
	else
		if [ -z "$3" ]
		then
			echo "Please enter cidr for subnet 1"
			echo "Format should be in sequence : 'VPC-CIDR' 'AVAILABILITY_REGION' 'SUBNET1_CIDR' 'SUBNET2_CIDR' 'SUBNET3_CIDR'"
			exit 1
		else
		    if [ -z "$4" ]
		    then
			    echo "Please enter cidr for subnet 2"
			    echo "Format should be in sequence : 'VPC-CIDR' 'AVAILABILITY_REGION' 'SUBNET1_CIDR' 'SUBNET2_CIDR' 'SUBNET3_CIDR'"
			    exit 1
			else
			   if [ -z "$5" ]
		        then
			        echo "Please enter cidr for subnet 3"
			        echo "Format should be in sequence : 'VPC-CIDR' 'AVAILABILITY_REGION' 'SUBNET1_CIDR' 'SUBNET2_CIDR' 'SUBNET3_CIDR'"
			        exit 1
			    fi
		    fi
		fi	
	fi	
fi

echo "VPC and Resources creation started"

#create vpc with cidr block /16
vpcId=$(aws ec2 create-vpc --cidr-block "$cidr" --query 'Vpc.VpcId' --output text)
if [ $? -eq 0 ]
then
    #Waiting util VPC is created
    aws ec2 wait vpc-available --vpc-ids "$vpcId"
	echo "VPC Created, ID : "$vpcId
	aws ec2 create-tags --resources "$vpcId" --tags Key=Name,Value="VPC:"$vpcId
else
	echo "VPC creation failed"
	exit 1
fi

#Finding availability zones for region
echo "Finding availability zones"
zone_response=$(aws ec2 describe-availability-zones --region "$availability_region" --output json)
if [ $? -eq 0 ]
then 
	zone1=$(echo -e "$zone_response" | jq '.AvailabilityZones[0].ZoneName' | tr -d '"')
	zone2=$(echo -e "$zone_response" | jq '.AvailabilityZones[1].ZoneName' | tr -d '"')
	zone3=$(echo -e "$zone_response" | jq '.AvailabilityZones[2].ZoneName' | tr -d '"')
else	
	echo "Zone not available"
	aws ec2  delete-vpc --vpc-id "$vpcId"
	exit 1
fi

#Creating Subnet for VPC
echo "Creating Subnet for VPC : "$vpcId

subnetId1=$(aws ec2 create-subnet --vpc-id "$vpcId" --cidr-block "$subnet1Cidr" \
--availability-zone "$zone1" --query "Subnet.SubnetId" --output text)
if [ $? -eq 0 ]
then
	echo "Subnet 1 created "$subnetId1
	aws ec2 create-tags --resources "$subnetId1" --tags Key=Name,Value="Subnet:"$subnetId1
else
	echo "Subnet 1 creation failed"
	aws ec2  delete-vpc --vpc-id "$vpcId"
	exit 1
fi

subnetId2=$(aws ec2 create-subnet --vpc-id "$vpcId" --cidr-block "$subnet2Cidr" \
--availability-zone "$zone2" --query "Subnet.SubnetId" --output text)
if [ $? -eq 0 ]
then
	echo "Subnet 2 created "$subnetId2
	aws ec2 create-tags --resources "$subnetId2" --tags Key=Name,Value="Subnet:"$subnetId2
else
	echo "Subnet 2 creation failed"
	aws ec2 delete-subnet --subnet-id "$subnetId1"
	aws ec2  delete-vpc --vpc-id "$vpcId"
	exit 1
fi

subnetId3=$(aws ec2 create-subnet --vpc-id "$vpcId" --cidr-block "$subnet3Cidr" \
--availability-zone "$zone3" --query "Subnet.SubnetId" --output text)
if [ $? -eq 0 ]
then
	echo "Subnet 3 created "$subnetId3
	aws ec2 create-tags --resources "$subnetId3" --tags Key=Name,Value="Subnet:"$subnetId3
else
	echo "Subnet 3 creation failed"
	aws ec2 delete-subnet --subnet-id "$subnetId2"
	aws ec2 delete-subnet --subnet-id "$subnetId1"
	aws ec2  delete-vpc --vpc-id "$vpcId"
	exit 1
fi

#Waiting until all subnet is created
aws ec2 wait subnet-available --subnet-ids "$subnetId1" "$subnetId2" "$subnetId3"

#Creating internet gateway"
gateway_Id=$(aws ec2 create-internet-gateway --query "InternetGateway.InternetGatewayId" \
--output text)
if [ $? -eq 0 ]
then
	echo "Internet Gateway created successfully. ID : "$gateway_Id
	aws ec2 create-tags --resources "$gateway_Id" --tags Key=Name,Value="IG:"$gateway_Id
else
	echo "Internet Gateway creation failed"
	exit 1
fi

#Attaching Internet gateway to VPC
gateway_attach_reponse=$(aws ec2 attach-internet-gateway --internet-gateway-id "$gateway_Id" \
--vpc-id "$vpcId" )
if [ $? -eq 0 ]
then
	echo "Internet Gateway $gateway_Id is attached to VPC "$vpcId
else
	echo "Failed to attach Gateway to VPC"
	exit 1
fi		

#Creating Routing Table
routingtable_Id=$(aws ec2 create-route-table --vpc-id "$vpcId" --query "RouteTable.RouteTableId" \
--output text)
if [ $? -eq 0 ]
then
	echo "Routing table created $routingtable_Id for VPC "$vpcId
	aws ec2 create-tags --resources "$routingtable_Id" --tags Key=Name,Value="RT:"$routingtable_Id

else
	echo "Failed to create routing table"
	exit 1
fi			

#Associating subnet to routing table
association_Id1=$(aws ec2 associate-route-table --route-table-id "$routingtable_Id" \
--subnet-id "$subnetId1")
association_Id2=$(aws ec2 associate-route-table --route-table-id "$routingtable_Id" \
--subnet-id "$subnetId2")
association_Id3=$(aws ec2 associate-route-table --route-table-id "$routingtable_Id" \
--subnet-id "$subnetId3")
if [ $? -eq 0 ]
then	
	echo "Subnet $subnetId1 $subnetId2 $subnetId3 attached to routing table "$routingtable_Id
else
	echo "Subnet association with routing table failed"
	exit 1
fi		


#Adding Route to Routing Table
addingroute=$(aws ec2 create-route --route-table-id "$routingtable_Id" --destination-cidr-block 0.0.0.0/0 \
--gateway-id "$gateway_Id")
if [ $? -eq 0 ]
then
	echo "Route 0.0.0.0 added Successfully to routing table "$routingtable_Id
else	
	echo "Route not added"	
	exit 1
fi
