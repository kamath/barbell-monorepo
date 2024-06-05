// Create a data object called "ubuntu" that holds the latest
// Ubuntu 20.04 server AMI
data "aws_ami" "ubuntu" {
  // We want the most recent AMI
  most_recent = "true"

  // We are filtering through the names of the AMIs. We want the
  // Ubuntu 20.04 server
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  // We are filtering through the virtualization type to make sure
  // we only find AMIs with a virtualization type of hvm
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  // This is the ID of the publisher that created the AMI.
  // The publisher of Ubuntu 20.04 LTS Focal is Canonical
  // and their ID is 099720109477
  owners = ["099720109477"]
}

// Create a key pair named "main_backend_kp"
resource "aws_key_pair" "main_backend_kp" {
  // Give the key pair a name
  key_name = "main_backend_kp"

  // This is going to be the public key of our
  // ssh key. The file directive grabs the file
  // from a specific path. Since the public key
  // was created in the same directory as main.tf
  // we can just put the name
  public_key = var.ec2_public_key
}

// Create an EC2 instance named "main_backend_web"
resource "aws_instance" "main_backend_web" {
  // count is the number of instance we want
  // since the variable settings.web_app.cont is set to 1, we will only get 1 EC2
  count = var.settings.web_app.count

  // Here we need to select the ami for the EC2. We are going to use the
  // ami data object we created called ubuntu, which is grabbing the latest
  // Ubuntu 20.04 ami
  ami = data.aws_ami.ubuntu.id

  // This is the instance type of the EC2 instance. The variable
  // settings.web_app.instance_type is set to "t2.micro"
  instance_type = var.settings.web_app.instance_type

  // The subnet ID for the EC2 instance. Since "main_backend_public_subnet" is a list
  // of public subnets, we want to grab the element based on the count variable.
  // Since count is 1, we will be grabbing the first subnet in
  // "main_backend_public_subnet" and putting the EC2 instance in there
  subnet_id = aws_subnet.main_backend_public_subnet[count.index].id

  // The key pair to connect to the EC2 instance. We are using the "main_backend_kp" key
  // pair that we created
  key_name = aws_key_pair.main_backend_kp.key_name

  // The security groups of the EC2 instance. This takes a list, however we only
  // have 1 security group for the EC2 instances.
  vpc_security_group_ids = [aws_security_group.main_backend_web_sg.id]

  // We are tagging the EC2 instance with the name "main_backend_db_" followed by
  // the count index
  tags = {
    Name = "main_backend_web_${count.index}"
  }
}
