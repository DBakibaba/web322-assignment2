/********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html 
*
*  Name: Dogukan Bakibaba   Student ID: 152860235   Date: 2025-12-05
*
*  Published URL: https://web322-assignment2-vert.vercel.app

*
********************************************************************************/

require('dotenv').config();
const express = require("express");
const clientSessions = require("client-sessions");
const app = express();
const projectData = require("./modules/projects");   
const PORT = process.env.PORT || 8080;
 
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(clientSessions({
  cookieName: "session",
  secret: process.env.SESSIONSECRET,
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(express.urlencoded({ extended: true }));

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/solutions/projects", async (req, res) => {
  try {
    let projects;
    
    if (req.query.sector) {
      projects = await projectData.getProjectsBySector(req.query.sector);
      
      if (projects.length === 0) {
        return res.status(404).render("404", { 
          message: `No projects found for sector: ${req.query.sector}` 
        });
      }
    } else {
      projects = await projectData.getAllProjects();
    }
    
    res.render("projects", { projects: projects });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.get("/solutions/addProject", ensureLogin, async (req, res) => {
  try {
    const sectors = await projectData.getAllSectors();
    res.render("addProject", { sectors: sectors });
  } catch (err) {
    res.status(500).send("Error loading form");
  }
});

app.post("/solutions/addProject", ensureLogin, async (req, res) => {
  try {
    await projectData.addProject(req.body);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
  try {
    const project = await projectData.getProjectById(req.params.id);
    const sectors = await projectData.getAllSectors();
    res.render("editProject", { project: project, sectors: sectors });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.post("/solutions/editProject", ensureLogin, async (req, res) => {
  try {
    await projectData.editProject(req.body.id, req.body);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/solutions/deleteProject/:id", ensureLogin, async (req, res) => {
  try {
    await projectData.deleteProject(req.params.id);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/login", (req, res) => {
  res.render("login", { errorMessage: "", userName: "" });
});

app.post("/login", (req, res) => {
  if (req.body.userName === process.env.ADMINUSER && req.body.password === process.env.ADMINPASSWORD) {
    req.session.user = {
      userName: process.env.ADMINUSER
    };
    res.redirect("/solutions/projects");
  } else {
    res.render("login", { errorMessage: "Invalid User Name or Password", userName: req.body.userName });
  }
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/solutions/projects/:id", async (req, res) => {
  try {
    const project = await projectData.getProjectById(req.params.id);
    res.render("project", { project: project });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.use((req, res) => {
  res.status(404).render("404", { 
    message: "I'm sorry, we're unable to find what you're looking for" 
  });
});

projectData.initialize().then(() => {
  app.listen(PORT, () => {
    console.log("server listening port: " + PORT);
  });
});
