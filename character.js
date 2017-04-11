
module.exports = {

  Joueur : function (io,numero,room) {

    /***********************************************************
    ***************** Définition des propriétés ****************
    ***********************************************************/

    this.io = io;
    this.room = room;
    this.numero = numero;
    this.size = 50;
    this.x = 200 + (numero) * 400 - this.size / 2;
    this.xMax = 400 + (numero) * 400 - this.size;
    this.xMin = 0 + (numero) * 400;

    this.y = 300 - this.size / 2;
    this.yMax = 600 - this.size;
    this.yMin = 0;

    this.vitesse = 4;
    this.deplacementGauche = "bloque";
    this.deplacementDroite = "bloque";
    this.deplacementHaut = "bloque";
    this.deplacementBas = "bloque";

    this.peutToucher = true;

    /***********************************************************
    ***************** Définition des propriétés ****************
    ***********************************************************/

    /*------------------ Animation du Palet ------------------*/

    this.setup = function(){
      this.stopMove();
      this.x = 200 + (numero) * 400 - this.size / 2;
      this.y = 300 - this.size / 2;
      this.updatePosition(true);
    };

    /*---------------- Déplacement du Palet ------------------*/

    this.versLaGauche = function(){
      if(this.deplacementGauche == false) {
        this.deplacementGauche = global.setInterval(
          function(){
            if(this.x > this.xMin){
              this.x = this.x - this.vitesse;
              this.updatePosition();
            }
          }.bind(this),10);
        }
      };

    this.versLaDroite = function(){
      if(this.deplacementDroite == false) {
        this.deplacementDroite = global.setInterval(
          function(){
            if(this.x < this.xMax){
              this.x = this.x + this.vitesse;
              this.updatePosition();
            }
          }.bind(this),10);
        }
      };

    this.versLeHaut = function(){
      if(this.deplacementHaut == false) {
        this.deplacementHaut = global.setInterval(
          function(){
            if(this.y > this.yMin){
              this.y = this.y - this.vitesse;
              this.updatePosition();
            }
          }.bind(this),10);
        }
      };

    this.versLeBas = function(){
      if(this.deplacementBas == false) {
        this.deplacementBas = global.setInterval(
          function(){
            if(this.y < this.yMax){
              this.y = this.y + this.vitesse;
              this.updatePosition();
            }
          }.bind(this),10);
        }
      };

    this.updatePosition = function(placer){
      this.io.in(this.room).emit("updatePosition",this.x,this.y,this.numero,placer);
    };

    this.startMove = function(){
      this.deplacementGauche = false;
      this.deplacementDroite = false;
      this.deplacementHaut = false;
      this.deplacementBas = false;
    };

    this.stopMove = function(){
      global.clearInterval(this.deplacementDroite);
      global.clearInterval(this.deplacementGauche);
      global.clearInterval(this.deplacementHaut);
      global.clearInterval(this.deplacementBas);
      this.deplacementGauche = "bloque";
      this.deplacementDroite = "bloque";
      this.deplacementHaut = "bloque";
      this.deplacementBas = "bloque";
    };
  }
}
