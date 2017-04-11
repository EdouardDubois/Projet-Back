var socket = io("http://127.0.0.1:8888/");
var objJoueur; // Caractéristiques du joueur
var joueursDemande; // Joueurs en cours d'invitation
var room; // La room dans laquelle est le joueur
var numero; // En jeu :  0 = gauche / 1 = droite
var peutToucher;

// Raccourcis menus
var boutonConfirmer = document.getElementById("boutonConfirmer");
var boutonRefuser = document.getElementById("boutonRefuser");
var boutonAnnuler = document.getElementById("boutonAnnuler");
var attente = document.getElementById("attente");
var fondScore = document.getElementById("fondScore");
var confirmation = document.getElementById("confirmation");
var points = document.getElementById("points");

// Raccourcis jeu
var perso0 = document.getElementById("perso0");
var perso1 = document.getElementById("perso1");
var timer = document.getElementById("timer");
var balle = document.getElementById("balle");
var score = [0,0];
var xPerso;
var yPerso;


/*********************************************************
************************ Lobby ***************************
*********************************************************/

/*---------------------- Réception ---------------------*/

// Reception de l'objet joueur
socket.on("attributionJoueur",function(nomRecu){
  console.log("Vous êtes : ",nomRecu);
  objJoueur = nomRecu;
});

// Ajout d'un joueur au lobby
socket.on("ajouterJoueur",function(joueur){
  var nom = document.querySelector(".nom");
  var joueurs = document.querySelector(".joueurs");
  var joueurRecu = document.createElement("div");
  var nomJoueur = document.createTextNode(joueur.nom);
  joueurRecu.id = joueur.id.toString();
  joueurRecu.className = "blocJoueur";
  if (joueur.dispo) {
    joueurRecu.style.backgroundColor = "#e1c048";
  } else {
    joueurRecu.style.backgroundColor = "#aa3333";
  }
  joueurRecu.appendChild(nomJoueur);
  if(joueurRecu.id == objJoueur.id){
    nom.insertBefore(joueurRecu, nom.firstChild);
  } else {
    joueurs.appendChild(joueurRecu);
    joueurRecu.addEventListener("click",function(click){
      demandeDispo(click);
      boutonAnnuler.addEventListener("click",function(osef){
        annulationDemande();
      });
    });
  }
});

// Enlever un joueur du lobby
socket.on("enleverJoueur",function(joueur,adversaire){
  document.getElementById(joueur.id).remove();
  if (adversaire) {
    document.getElementById(adversaire).style.backgroundColor = "#e1c048";
    if (adversaire == objJoueur.id) {
      socket.emit("attributionAdversaire",undefined);
      confirmation.style.display = "none";
      attente.style.display = "none";
      // Enlever les event listeners
    }
  }
});

/*******************************************************
************************ Rooms *************************
*******************************************************/

/*-------------------- Emissions ---------------------*/

// Demande d'autorisation pour l'envoi de la demande
var demandeDispo = function(objClick){
  socket.emit("demandeDispo",objClick.target.id);
};

var annulationDemande = function(){
  socket.emit("annulationDemande",joueursDemande);
  attente.style.display = "none";
  rendreDispo(joueursDemande);
};

/*-------------------- Réception ---------------------*/

// Envoi de la demande autorisé
socket.on("joueurDispo",function(joueur){
  joueursDemande = {
    "host": objJoueur.id.toString(),
    "invite":joueur
  };

  socket.emit("envoiDemande",joueursDemande);
  attente.children[1].innerHTML = document.getElementById(joueur).innerHTML;
  attente.style.display = "block";
  rendreOccupe(joueursDemande);
});

// attribution d'un adversaire
socket.on("attributionAdversaire",function(joueur){
  socket.emit("attributionAdversaire",joueur);
});

// Reception de la demande
socket.on("envoiDemande",function(joueursRoom){
  boutonConfirmer.addEventListener("click",function (){
    repondre(true,joueursRoom)});
  boutonRefuser.addEventListener("click",function (){
    repondre(false,joueursRoom)});
  confirmation.children[1].innerHTML = document.getElementById(joueursRoom.host).innerHTML;
  confirmation.style.display = "block";
});
var repondre = function(action,joueursRoom){
  if (action) {
    socket.emit("confirmationRoom",joueursRoom);
  } else {
    socket.emit("refusRoom",joueursRoom);
    rendreDispo(joueursRoom);
  }
  confirmation.style.display = "none";
};

// Demande annulée
socket.on("annulationDemande",function(joueursRoom){
  confirmation.style.display = "none";
  rendreDispo(joueursRoom);
   // Je dois supprimer des event listeners.
});

// Demande refusée
socket.on("refusRoom",function(joueursRoom){
  attente.style.display = "none";
  rendreDispo(joueursRoom);
   // Je dois supprimer l'event listener de la demande.
});

// Update des dispos
socket.on("updateDispo",function(joueursRoom,statut){
  if(statut){
    rendreDispo(joueursRoom);
  } else {
    rendreOccupe(joueursRoom);
  }
});

var rendreDispo = function(joueursRoom){
  document.getElementById(joueursRoom.host).style.backgroundColor = "#e1c048";
  document.getElementById(joueursRoom.invite).style.backgroundColor = "#e1c048";
};

var rendreOccupe = function(joueursRoom){
  document.getElementById(joueursRoom.host).style.backgroundColor = "#aa3333";
  document.getElementById(joueursRoom.invite).style.backgroundColor = "#aa3333";
};

/*******************************************************
************************ Jeu ***************************
*******************************************************/

/*--------------------- Réception --------------------*/

// Attibution du numéro de joueur (pour positionner)
socket.on("attributionRoomJ0",function(roomAttribuee,service){
  numero = 0;
  charCreation(roomAttribuee,service);
});

socket.on("attributionRoomJ1",function(roomAttribuee,service){
  numero = 1;
  charCreation(roomAttribuee,service);
});

socket.on("attributionBalle",function(balleNumber){
  socket.emit("attributionBalle",balleNumber);
});

var charCreation = function(roomAttribuee,service){
  console.log("Tu es le joueur : ",numero);
  console.log("Service : ",service);
  room = roomAttribuee;
  attente.style.display = "none";
  fondScore.style.display = "block";
  socket.emit("charCreation",room,numero);
  initBalle(service);
}

var initBalle = function (joueur){
  var countdown = 3;
  timer.style.display = "block";
  var countdownInterval = window.setInterval(function(){
    timer.innerHTML = countdown;
    countdown = countdown - 1;
    if (countdown <= -1) {
      timer.innerHTML = "";
      clearInterval(countdownInterval);
      timer.style.display = "none";
        socket.emit("service",joueur);
    }
  },1000);
}

socket.on("updatePosition",function(x,y,joueur,placer){
  if (joueur == 1) {
    perso0.style.top = y + "px";
    perso0.style.left = x + "px";
    if (placer) {
      perso0.style.display = "block";
    }
  } else {
    perso1.style.top = y + "px";
    perso1.style.left = x + "px";
    if (placer) {
      perso1.style.display = "block";
    }
  }
  if (joueur == numero) {
    xPerso = x;
    yPerso = y;
  }
});

socket.on("peutToucher",function(joueur){
  console.log(joueur,numero);
  if(joueur == numero){
    peutToucher = false;
    console.log(peutToucher);
  } else {
    peutToucher = true;
    console.log(peutToucher);
  }
});

socket.on("positionBalle",function(x,y){
  balle.style.left = x + "px";
  balle.style.top = y + "px";
  checkCollision(x,y);
});

socket.on("afficherBalle",function(affichage){
  if (affichage) {
    balle.style.display = "block";
  } else {
    balle.style.display = "none";
  }
});

socket.on("goal",function(gagnant,perdant){
  socket.emit("resetPerso");
  score[gagnant] ++;
  points.innerHTML = score[0] + " - " + score[1];
  if (score[gagnant] >= 10) {
    if (numero = gagnant) {
      victoire();
    } else {
      defaite();
    }
  } else {
    initBalle(perdant);
  }
});

var checkCollision = function(x,y){
  if (xPerso + 50 >= x && xPerso <= x + 30 && yPerso + 50 >= y && yPerso <= y + 30 && peutToucher == true) {
    peutToucher = false;
    console.log("renvoi !");
    socket.emit("renvoi",numero);
  }
}

/*--------------------- Émission --------------------*/
