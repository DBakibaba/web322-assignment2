 
const projectData = require("../data/projectData");
const sectorData  = require("../data/sectorData");

let projects = [];  

function initialize() {
  return new Promise((resolve, reject) => {
    try {
      projects = [];
      projectData.forEach(p => {
        const sector = sectorData.find(s => s.id === p.sector_id);
        projects.push({ ...p, sector: sector ? sector.sector_name : "Unknown" });
      });
      resolve();  
    } catch (err) {
      reject("Initialization failed.");
    }
  });
}

function getAllProjects() {
  return new Promise((resolve, reject) => {
    if (projects.length) resolve(projects);
    else reject("No project data. Did you call initialize()?");
  });
}

function getProjectById(projectId) {
  return new Promise((resolve, reject) => {
    const id = Number(projectId);
    const item = projects.find(p => p.id === id);
    item ? resolve(item) : reject("Unable to find requested project");
  });
}

function getProjectsBySector(sector) {
  return new Promise((resolve, reject) => {
    const q = String(sector || "").toLowerCase();
    const list = projects.filter(p => String(p.sector || "").toLowerCase().includes(q));
    list.length ? resolve(list) : reject("Unable to find requested projects");
  });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };
