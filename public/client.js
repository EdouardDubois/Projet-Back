(function(window, io){

  window.addEventListener("DOMContentLoaded",function(){

    var socket = io("http://127.0.0.1:8888/");
    var objJoueur;

    /********************** Émission ************************/


    /********************* Réceptions ***********************/

    // Reception de l'objet joueur
    socket.on("attributionJoueur",function(nomRecu){
      console.log("Vous êtes : " + JSON.stringify(nomRecu));
      objJoueur = nomRecu;
    });

    // Ajout d'un joueur au lobby
    socket.on("ajouterJoueur",function(joueur){
      console.log("Nouveau joueur : ",joueur);
      var nom = document.querySelector(".nom");
      var joueurs = document.querySelector(".joueurs");
      var joueurRecu = document.createElement("div");
      var nomJoueur = document.createTextNode(joueur.nom);
      joueurRecu.id = joueur.id.toString();
      joueurRecu.className = "blocJoueur";
      joueurRecu.appendChild(nomJoueur);
      if(joueurRecu.id == objJoueur.id){
        joueurRecu.style.backgroundColor = "#006600";
        nom.insertBefore(joueurRecu, nom.firstChild);
      } else {
        joueurRecu.style.backgroundColor = "#e1c048";
        joueurs.appendChild(joueurRecu);
      }
    });

    // Enlever un joueur du lobby
    socket.on("enleverJoueur",function(joueur){
      console.log("Enlever joueur : ",joueur);
      document.getElementById(joueur.id).remove();
    });

    //

  });

})(window, io);
