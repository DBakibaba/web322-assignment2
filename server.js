/********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html 
*
*  Name: Dogukan Bakibaba   Student ID: 152860235   Date: 2025-11-07
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/

const express = require("express");
const app = express();
const projectData = require("./modules/projects");   
const PORT = process.env.PORT || 8080;
 
app.use(express.static("public"));
app.set('view engine', 'ejs');

 
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

 
app.get("/solutions/projects/:id", async (req, res) => {
  try {
    const project = await projectData.getProjectById(req.params.id);
    res.render("project", { project: project });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

// OLD ROUTES 
/*
app.get("/solutions/projects/id-demo", async (req, res) => {
  try {
    res.json(await projectData.getProjectById(9));
  } catch (err) {
    res.status(404).send(err.message);
  }
});

app.get("/solutions/projects/sector-demo", async (req, res) => {
  try {
    res.json(await projectData.getProjectsBySector("agriculture"));
  } catch (err) {
    res.status(404).send(err.message);
  }
});
*/

 
app.use((req, res) => {
  res.status(404).render("404", { 
    message: "I'm sorry, we're unable to find what you're looking for" 
  });
});

 
projectData.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}).catch(err => {
  console.error("Data initialization failed:", err);
});