
Schedula - Event Management
System

Official documentation for the Schedula backend API project.

1. Project Description
Schedula is a centralized platform developed for EventHub to help users
organize and manage events digitally . It handles secure user
accounts and event management, ensuring that only authenticated users can
access the application .

3. Technologies Used
Node.js & Express.js: Server-side runtime and web framework .
MySQL: Relational database .
express-session: User login and authentication management .
bcryptjs: Secure password hashing .
mysql2: Database driver for SQL queries .

4. Database Structure

Users Table
id : Primary Key
name : Full name 
email : Unique email 
phone : Contact number 
password : Hashed password 
created_at : Timestamp 

Events Table

id : Primary Key 
title : Event name 
description : Event details 
location : Where the event takes place 
date : Event date 
user_id : Foreign Key (Owner) 
4. API Endpoints

Method Route Description
POST /api/auth/register Create new user 

POST /api/auth/login Authenticate and start session \

GET /api/auth/logout Destroy session 

GET /api/auth/me Get current user 

POST /api/events Create event 

GET /api/events Get all events 

GET /api/events/:id Get single event 

PUT /api/events/:id Update event 

DELETE /api/events/:id Delete event 

5. Validations & Constraints

Fields cannot be empty 

Email and Phone must be unique

Phone must be 10-15 digits 

Password must be 6-8 characters long 
