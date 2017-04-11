
/*********************************************************
********************** Keybindings ***********************
**********************************************************

------------------- Quand on appuie --------------------*/

window.onkeydown = function(event){
  var code = event.keyCode;
  switch(code){

    case 37: // Appuyer sur la touche Gauche
    socket.emit("deplacer","gauche");
    break;

    case 38: // Appuyer sur la touche Haut
    socket.emit("deplacer","haut");
    break;

    case 39: // Appuyer sur la touche Droite
    socket.emit("deplacer","droite");
    break;

    case 40: // Appuyer sur la touche Haut
    socket.emit("deplacer","bas");
    break;

    case 13: // Appuyer sur Entrée
    socket.emit("renvoi");
    console.log("renvoi !");
    break;

  }
}

/*---------------- Quand on relâche ------------------*/

window.onkeyup = function(event){
  switch (event.keyCode) {

    case 37:
    socket.emit("arreterDeplacement","gauche");
    break;

    case 38:
    socket.emit("arreterDeplacement","haut");
    break;

    case 39:
    socket.emit("arreterDeplacement","droite");
    break;

    case 40:
    socket.emit("arreterDeplacement","bas");
    break;

  }
}

/*-------------- Quand on gagne ou perd ----------------*/

var victoire = function(){
  // Augmenter le score
  // window.document.querySelector("#ecranFin").style.backgroundImage = "url('img/victoire.png')";
  finir();
}

var defaite = function(){
  // Diminuer le score
  // window.document.querySelector("#ecranFin").style.backgroundImage = "url('img/defaite.png')";
  finir();
}

var finir = function(){
  // window.document.querySelector("#ecranFin").style.display = "block";
  // balle.stop(); // Stoper les keys
  // palet.stop(); // Stoper les keys
}
