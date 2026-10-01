# backlog
- upload file to folder/subfolder (filesystem) + file validation
- upload file (cloudinary)
- delete file (maybe use dialog here to see the implementation)
- rename file
- file details
- shared folder
- move file (optional)
- move folder (optional)

# done
- folders/subfolders crud + folder navigation
- registration + authentication + session
- guarded dashboard
- once authentication works see how all dependencies work together


# target
- [28/9] authentication system + session + first guarded routes
- [29/9] folders create and delete
- [30/9] subfolders creation
- [1/10] subfolder navigation

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
