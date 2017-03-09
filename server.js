
/************************************************************
************************** Serveur HTTP *********************
************************************************************/

const chalk = require("chalk");

// Express
const express = require("express");
const app = module.exports.app = express();
app.use(express.static(__dirname + '/public'));

// Serveur http
const http = require("http");
const httpServer = http.createServer(app);

// Socket.io
const io = require('socket.io');
const socketIOWebSocketServer = io(httpServer);

// // Mongo
// const MongoClient = require("mongodb").MongoClient;
// const URL = "mongodb://127.0.0.1:27017/blog";
// var maDb;

app.get("/", function (req, res) {
  // var articles = maDb.collection("articles");
  // articles.find({}).toArray(function(err, data){
  res.render("index.html",function(erreur, donnees){
    if (erreur) {
      res.status(404).send("404 - Impossible de charger la page");
    } else {
      res.send(donnees);
    }
  });
  // }); // Réactiver avec Mongo
});

/************************************************************
*********************** Serveur Websocket *******************
************************************************************/

var joueurs = []; // Liste de tous les joueurs
var rooms = []; // Liste de toutes les rooms

/*************************** Lobby *************************/

//Connexion au lobby
socketIOWebSocketServer.on("connection", function (socket) {
  // A la connexion au serveur on crée un joueur dans le lobby
  var joueur = {
    id: Math.random(),
    nom: "Joueur_" + Math.trunc(Math.random()*1000)
  };
  // On le push dans l'Array des joueurs
  joueurs.push(joueur);
  //On l'envoi au client
  socket.emit("attributionJoueur",joueur);
  // On génère tous les carrés pour le client
  for (var i = 0; i < joueurs.length; i++) {
    socket.emit("ajouterJoueur",joueurs[i]);
  }
  // On l'envoi à toutes les autres connexions
  socket.broadcast.emit("ajouterJoueur",joueur);

  // Déconnexion du lobby
  socket.on("disconnect",function(objJoueur){
    // On crée une image à comparer
    var image = joueurs;
    for (var i = 0; image.length > i; i++) {
      if(image[i].id == joueur.id){
        // On enlève des connexions et on envoi au front
        joueurs.splice(i,1);
        socket.broadcast.emit("enleverJoueur",joueur);
        break;
      }
    }
  });

  /**************************** Jeu ***********************/



});

// Écoute du serveur
httpServer.listen(8888,function(){
  console.log(chalk.bgWhite.black("Serveur accessible à l'adresse:" + chalk.bgBlue.black(" 127.0.0.1:8888")));
  console.log();
});
