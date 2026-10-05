# backlog
- upload file (cloudinary)
- delete file (cloudinary)
- download (cloudinary)
- shared folder
- styles
- move file (optional)
- move folder (optional)
- replace/overwrite file (optional)

# done
- rename file (use dialog)
- download
- file details
- delete file (maybe use dialog here to see the implementation)
- upload file to folder/subfolder (filesystem) + file validation
- folders/subfolders crud + folder navigation
- registration + authentication + session
- guarded dashboard
- once authentication works see how all dependencies work together


# target
- [28/9] authentication system + session + first guarded routes
- [29/9] folders create and delete
- [30/9] subfolders creation
- [1/10] subfolder navigation
- [2/10] upload file to folder (filesystem) + error handling
- [3/10] delete file (database + filesystem)
- [4/10] file details
- [5/10] download file, rename file

# takeaways
- [28/9]: 
    - body parsing and session before routes
    - passport.session() after session()
    - serializeUser stores user id, deserializeUser rebuilds req.user on every request by querying the database
    - @map() to connect or change name from schema.prisma field with database column and @@map() for the whole entity to table
    - npx prisma migrate dev --name insert_name_here and npx prisma generate to create generated/prisma scripts after each migration
    - select { username: true} to select field in prisma query
    - passsport.authenticate(...) in the post login request and not req.login in order passport to call verifyCallback and check the password
    - req.flash (from connect-flash) to pass messages while redirecting (login error messages for example)
- [29/9]: 
    - validator should check if data is correct, controller checks ownership
    - post with bad data -> re-render, get with malformed query -> render/redirect to error page
    - firstUnique needs unique values to database query
    - controller should not depend on side effects/quests of the validator (e.g. req.resolvedParentFolder = parentFolder)
    - you can inspect the validator's error array's location to see where the error came from (like query, body or param)
- [30/9]:
    - you can sanitize form values and return then for matchedData without withMessage and strict rules that returns an error - you have to use escape()
    - in case of editing to pass context when pressing the edit button on the current folder or the subfolder list use query params instead of flash messages or session
    - also dont break main features like editing if secondary helper like query param of url redirect hint is formatted incorrectly
    - on the client side you have to handle known errors coming from the controller using the status codes, general errors that may be returned (choose when to parse to json) all these inside try with ifs and then on the catch you have to handle client side errors that may occur
    - client side should have errors dynamically rendered into screen, server side you have to reload page while passing errors or redirect
    - if you wont to write to server logs errors that occur on client side you have to create a backend enpoint and request it inside the catch
    - to get nested entities from the database you may use materilized paths with is a field on the model that holds the current path as a string value or use recursive CTEs (common table expressions) which is a reqursive query that is strored in a stored procedure for example when you use prisma because prisma doesnt support neither
    - session lives on the databse (redis, postgres) and uses cookies' connect.sid to return its connect on each request - cookies are stored in browser
    - redux = state management for react and dies on refresh
- [1/10]:
    - stored procedures are for inserting or updating, and functions are for selecting
    - we used RETURNS TABLE for the function signature and RETURN QUERY inside the BEGIN...END to tell psql to execute the query
    - WITH RECURSIVE path AS (...UNION/UNION ALL...) SELECT * FROM path --> for the recursive cte query
    - inside $queryRaw we had to SELECT * FROM get_folder_path(...) (we couldn't do SELECT get_folder_path(...) although in works inside psql) otherwise what was returned could not be serialized (an entity 'record') by prisma
    - for file upload checks we have to do them in middlewares before hitting the controller or validator - we needed an upload.js as middleware where we initialize multer and then an error handling middleware in the route level before hitting the controller
 - [2/10]:
    - file validation should not be done with express validator because the file is validated after it has been uploaded
    - file validation is done using the multer options properties (you can check file size using limits property or add a custom fileFilter function)
    - fileFilter function is executed before limits, uses the file's metadata for the checks and if the file doesnt meet requirement it instantly rejects - then it calls cb function (which means callback) that recieves error as first argument and and a boolean for acceptance as the second argument - then the multer source code function like single calls next (which you can't see it but it is inside the functions implementation in the library) which then is caught by the next error handling middleware (which is inside the fileRouter.js) which adds the error to the flash message and redirects
    - limits.fileSize property starts counting the bytes of the file once the server start downloading it and it stops its if it exceeds the limit calling next and going again to the middleware function - and that is why you cannot have both errors displaying with one failed upload request
    - the fileRouter middleware that handles file validation should redirect in case of error 
    - delete file dialog form should use query params to redirect the user correctly with context after deletion
    - put dialog outside ejs for and pass the files details needed for the delete request via javascript
- [3/10]:
    - using a foreign key's field name to assign a value and establish a connect in prisma is totally vadid and you don't have to use connect (connect is better for many to many)
    - import.meta.dirname and process.cwd() are the modern ways to get the pathname of the directory in node 
- [5/10]: 
    - to download a file attatch the get url (that routes to the controller download function) to an <a></a> tag and it will download on clicking without anything else



# structure
.
├── app.js <br>
├── config <br>
│   ├── cloudinary.js       # Or supabase.js, for step 6 cloud integration
│   └── passport.js
├── controllers
│   ├── authController.js
│   ├── dashboardController.js
│   ├── fileController.js
│   ├── folderController.js
│   └── shareController.js  # For the extra credit feature
├── lib
│   └── prisma.js
├── middlewares
│   ├── auth.js
│   ├── upload.js           # Multer configuration
│   └── validator.js        # express-validator logic
├── public
│   ├── css
│   ├── js
│   └── uploads             # Temporary local storage for step 3 before cloud
├── prisma
│   └── schema.prisma
├── prisma7.config.js
├── routes
│   ├── authRouter.js
│   ├── dashboardRouter.js
│   ├── fileRouter.js
│   ├── folderRouter.js
│   ├── index.js
│   └── shareRouter.js
├── services
│   └── storageService.js   # Abstraction layer to handle file up./del. (Disk vs Cloud)
└── views
    ├── dashboard.ejs       # The authenticated user's main view
    ├── fileDetails.ejs     # For step 5 (name, size, upload time, download button)
    ├── folderView.ejs      # Viewing the contents of a specific folder
    ├── index.ejs           # Public landing page
    ├── loginForm.ejs
    ├── registerForm.ejs
    ├── shareView.ejs       # Public view for shared folders (extra credit)
    └── partials
        ├── errors.ejs
        ├── folderModal.ejs # Optional: For creating/editing folders via modal
        └── header.ejs
