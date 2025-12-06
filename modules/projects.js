require("dotenv").config();
require("pg");
const Sequelize = require("sequelize");

let sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    }
  }
);

const Sector = sequelize.define("Sector", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sector_name: Sequelize.STRING
}, {
  createdAt: false,
  updatedAt: false
});

const Project = sequelize.define("Project", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: Sequelize.STRING,
  feature_img_url: Sequelize.STRING,
  summary_short: Sequelize.TEXT,
  intro_short: Sequelize.TEXT,
  impact: Sequelize.TEXT,
  original_source_url: Sequelize.STRING,
  sector_id: Sequelize.INTEGER
}, {
  createdAt: false,
  updatedAt: false
});

Project.belongsTo(Sector, { foreignKey: "sector_id" });

function initialize() {
  return sequelize.sync();
}

function getAllProjects() {
  return Project.findAll({ include: [Sector] });
}

function getProjectById(id) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      where: { id: id }
    })
    .then(data => {
      if (data.length > 0) {
        resolve(data[0]);
      } else {
        reject("Unable to find requested project");
      }
    })
    .catch(() => reject("Unable to find requested project"));
  });
}

function getProjectsBySector(sector) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      where: {
        '$Sector.sector_name$': {
          [Sequelize.Op.iLike]: `%${sector}%`
        }
      }
    })
    .then(data => {
      if (data.length > 0) {
        resolve(data);
      } else {
        reject("Unable to find requested projects");
      }
    })
    .catch(() => reject("Unable to find requested projects"));
  });
}

function getAllSectors() {
  return Sector.findAll();
}

function addProject(projectData) {
  return new Promise((resolve, reject) => {
    delete projectData.id;
    Project.create(projectData)
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

function editProject(id, projectData) {
  return new Promise((resolve, reject) => {
    Project.update(projectData, { where: { id: id } })
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

function deleteProject(id) {
  return new Promise((resolve, reject) => {
    Project.destroy({ where: { id: id } })
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject
};