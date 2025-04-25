
# School Management System

It is a School Management System where user can send its latitude and longitude to the api and it will show the closest school nearby accordint to him or her position. We have to add schools for that providing their name, address, latitude, longitude.

The api is live
link: https://school-management-api-kohl.vercel.app/

endpoints:-
(i) /addSchool: provide name , address, latitude, longitude in the body and send a post request to add a school in the database

(ii) /listSchools?latitude=query&longitude=query:
send a get request providing user latitude and longitude in the query to get the closest school

