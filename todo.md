# backlog
- registration + authentication + session
- guarded dashboard
- once authentication works see how all dependencies work together

# done


# target
- [28/9] authentication system + session + first guarded routes

# takeaways
- [28/9]


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
