# backlog
- folders/subfolders crud + folder navigation
- upload file to folder/subfolder (filesystem) + file validation
- upload file (cloudinary)
- delete file
- rename file
- file details
- shared folder
- move file (optional)

# done
- registration + authentication + session
- guarded dashboard
- once authentication works see how all dependencies work together


# target
- [28/9] authentication system + session + first guarded routes
- [29/9] folders create and delete
- [30/9] subfolders creation + navigation

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
    - controller should not depend on side quests of the validator (e.g. req.resolvedParentFolder = parentFolder)
    - you can inspect the validator's error array to see where the error came from


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
