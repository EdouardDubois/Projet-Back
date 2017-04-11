// Mettre sur un serveur
// -- Gestion de l'hébergement
// -- Gestion de la base de donnée

// Intégration avec Mongo
// -- Gestion des comptes
// -- Gestion des avatars
// -- Gestion des scores
// -- Possibilité de modifier le nom
// (Attention : sauvegarde en BDD asynchrone)

// Gérer les décos
// -- Annuler les eventListener sur les boutons
// -- Quitter une partie en cours

/************************************************************
************************** Serveur HTTP *********************
************************************************************/

// Fichiers Externes
const Character = require("./character");
const Balle = require("./balle");

// Packages
const chalk = require("chalk");

// Express
const express = require("express");
const app = module.exports.app = express();
app.use(express.static(__dirname + '/public'));

// Serveur http
const http = require("http");
const httpServer = http.createServer(app);

// Socket.io
const io = require('socket.io').listen(httpServer);

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
var connexions = []; // La liste de tous les connexions
var balles = [];

/*************************** Lobby *************************/

//Connexion au lobby
io.on("connection", function (socket) {

  var room = undefined;
  var perso = undefined;
  var numero = undefined;
  var balleNumber = undefined;
  var balle = undefined;

  // A la connexion au serveur on crée un joueur dans le lobby
  var joueur = {
    id: socket.id,
    nom: "Joueur_" + Math.trunc(Math.random()*10000000000000),
    dispo: true,
    lobbyNumber: joueurs.length
  };

  var adversaire = undefined;

  // On le push dans l'Array des joueurs
  joueurs.push(joueur);
  connexions.push(socket);
  //On l'envoi au client
  socket.emit("attributionJoueur",joueur);
  // On génère tous les carrés pour le client
  for (var i = 0; i < joueurs.length; i++) {
    socket.emit("ajouterJoueur",joueurs[i]);
  }
  // On l'envoi à toutes les autres connexions
  socket.broadcast.emit("ajouterJoueur",joueur);

  /************************** Room ***********************/

  //------------- Demande et setup de la room ------------/

  socket.on("demandeDispo",function(invite){
    for (var i = 0; joueurs.length > i; i++) {
      if(joueurs[i].id == invite){
        if (joueurs[i].dispo == true) {
          socket.emit("joueurDispo",invite);
          // Attribution des adversaires
          socket.broadcast.to(invite).emit("attributionAdversaire",joueur.id);
          socket.emit("attributionAdversaire",joueurs[i].id);
        }
      }
    }
  });

  // Attribution de l'adversaire
  socket.on("attributionAdversaire",function(adversaireAttribue){
    adversaire = adversaireAttribue;
    if (adversaire == undefined) {
      for (var i = 0; joueurs.length > i; i++) {
        if(joueurs[i].id == joueur.id){
          joueurs[i].dispo = true;
          room = undefined;
        }
      }
    }
  });

  socket.on("envoiDemande",function(joueursRoom){
    // Mise à jour des dispos
    for (var i = 0; joueurs.length > i; i++) {
      if(joueurs[i].id == joueursRoom.host || joueurs[i].id == joueursRoom.invite){
        joueurs[i].dispo = false;
      }
    }
    socket.broadcast.emit("updateDispo",joueursRoom,false);
    socket.broadcast.to(joueursRoom.invite).emit("envoiDemande",
    joueursRoom);
  });

  socket.on("annulationDemande",function(joueursRoom){
    // Mise à jour des dispos
    for (var i = 0; joueurs.length > i; i++) {
      if(joueurs[i].id == joueursRoom.host || joueurs[i].id == joueursRoom.invite){
        joueurs[i].dispo = true;
      }
    }
    socket.broadcast.emit("updateDispo",joueursRoom,true);
    socket.broadcast.to(joueursRoom.invite).emit("annulationDemande",joueursRoom);
  });

  socket.on("refusRoom",function(joueursRoom){
    // Mise à jour des dispos
    for (var i = 0; joueurs.length > i; i++) {
      if(joueurs[i].id == joueursRoom.host || joueurs[i].id == joueursRoom.invite){
        joueurs[i].dispo = true;
      }
    }
    socket.broadcast.emit("updateDispo",joueursRoom,true);
    socket.broadcast.to(joueursRoom.host).emit("refusRoom",
    joueursRoom);
  });

  //------------------ Création de la room -----------------/

  socket.on("confirmationRoom",function(joueursRoom){

    // Création de la balle
    var newBalle = new Balle.balle(io);
    balles.push(newBalle);
    balleNumber = balles.length - 1;

    // Création de la room
    var tempRoom = "Room_" + joueursRoom.host;
    var service = Math.round(Math.random());

    // Faire rejoindre le host
    for (var i = 0; connexions.length > i; i++) {
      if(connexions[i].id == joueursRoom.host){
        connexions[i].join(tempRoom);
        break;
      }
    }

    // Faire rejoindre l'invité
    socket.join(tempRoom);

    // Attribution des rooms
    socket.broadcast.to(joueursRoom.host).emit("attributionRoomJ0",tempRoom,service);
    socket.emit("attributionRoomJ1",tempRoom,service);

  });

  //----------------------- Partie ----------------------//

  socket.on("charCreation",function(laRoom,leNumero){
    room = laRoom;
    numero = leNumero;
    if (balleNumber != undefined) {
      io.in(room).emit("attributionBalle",balleNumber);
    }
    perso = new Character.Joueur(io,numero,room);
    perso.setup();
  });

  socket.on("attributionBalle",function(numeroBalle){
    balle = balles[numeroBalle];
    balle.room = room;
  });

  socket.on("service",function(service){
    socket.emit("peutToucher",service);
    perso.startMove();
    if (numero == service) {
      console.log(numero," au service");
      balle.init(service);
    }
  });

  socket.on("renvoi",function(renvoyeur){
    io.in(room).emit("peutToucher",renvoyeur);    console.log(renvoyeur, " renvoi la balle !");
    balle.lancer(renvoyeur);
  });

  socket.on("resetPerso",function(){
    perso.setup();
  });

  socket.on("deplacer",function(direction){
    if(perso){
    switch (direction) {

      case "gauche":
      perso.versLaGauche();
      break;

      case "droite":
      perso.versLaDroite();
      break;

      case "haut":
      perso.versLeHaut();
      break;

      case "bas":
      perso.versLeBas();
      break;
    }
  }
  });

  socket.on("arreterDeplacement",function(direction){
    if(perso){
      switch (direction) {
        case "gauche":
        if (perso.deplacementGauche != "bloque") {
          global.clearInterval(perso.deplacementGauche);
          perso.deplacementGauche = false;
        }
        break;

        case "droite":
        if (perso.deplacementDroite != "bloque") {
          global.clearInterval(perso.deplacementDroite);
          perso.deplacementDroite = false;
        }
        break;

        case "haut":
        if (perso.deplacementHaut != "bloque") {
          global.clearInterval(perso.deplacementHaut);
          perso.deplacementHaut = false;
        }
        break;

        case "bas":
        if (perso.deplacementBas != "bloque") {
          global.clearInterval(perso.deplacementBas);
          perso.deplacementBas = false;
        }
        break;
      }
    }
  });

  //------------------------ Fin -----------------------//

  socket.on("victoire",function(){
    // Chercher dans la BDD ajouter une victoire.
    // Ajouter le match à l'historique.
  });

  socket.on("defaite",function(objJoueur){
    // Cherche dans la BDD ajouter une défaite.
  });

  /*************** Gestion des déconnections ************/

  socket.on("disconnect",function(objJoueur){
    // On crée une image à comparer
    var image = joueurs;
    for (var i = 0; image.length > i; i++) {
      if(image[i].id == joueur.id){
        // On enlève des joueurs et on envoi au front
        joueurs.splice(i,1);
        connexions.splice(i,1);
        socket.broadcast.emit("enleverJoueur",joueur,adversaire);
        break;
      }
    }
  });

});

// Écoute du serveur
httpServer.listen(process.env.PORT || 8888,function(){
  console.log(chalk.bgWhite.black("Serveur accessible à l'adresse:" + chalk.bgBlue.black(" 127.0.0.1:8888")));
});
