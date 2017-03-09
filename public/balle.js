
var disque = {

  /*-------------------------- Liste des propriétés ----------------------------

  x
  y
  rayon
  couleur
  div
  mouvement
  vx
  vy
  dir
  speed

  ----------------------------- Liste des methodes -----------------------------

  verifCollisionMurs
  verifCollisionJoueur
  setup
  lancer
  stop

  ******************************************************************************
  ************************** Définition des propriétés *************************
  *****************************************************************************/

  x: 0,
  y: 0,
  rayon: 30,
  couleur: "#e1c048",
  div: window.document.querySelector("#disque"),
  mouvement: null,

  /*---------------------- Propriétés pour le mouvement ----------------------*/

  vx: 0,
  vy: 0,
  dir: 0,
  speed: 6,


  /*****************************************************************************
  *************************** Définition des méthodes **************************
  *****************************************************************************/

  verifCollisionMurs: function(horizontal){
    if (this.x <= 20){
      joueurs[0].defaite
    }
    if (this.y <= 20 || this.y >= 580) {
      this.dir = -this.dir;
      this.vx = Math.cos(this.dir)*this.speed;
      this.vy = Math.sin(this.dir)*this.speed;
    }
  },

  verifCollisionJoueur: function(){
    if (this.x >= joueur1.x && this.x <= joueur1.x + 256) { // Trouver collision cercle + carré
      // Mode de lancer
    }
  },

  setup: function(){
    this.x = joueur1.x;
    this.y = joueur1.y;
    this.div.style.backgroundColor = this.couleur;
  },

  lancer: function(){
    this.mouvement = window.setInterval(
      function(){
        this.x = this.x + this.vx;
        this.y = this.y + this.vy;
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";
        this.verifCollisionMurs();
        this.verifCollisionJoueur();
      }.bind(this),10);
      this.div.style.display = "block";
    },

    stop: function(){
      window.clearInterval(this.bouger);
      this.bouger = null;
      this.div.style.display = "none";
    }

  }
