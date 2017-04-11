
module.exports = {

  balle : function (io) {

    /***********************************************************
    ***************** Définition des propriétés ****************
    ***********************************************************/

    this.io = io;
    this.room;
    this.x = 0;
    this.y = 0;
    this.rayon = 30;

    /*------------- Propriétés pour le mouvement -------------*/

    this.mouvement = null;
    this.vx = 3;
    this.vy = 3;
    this.dir = 0;
    this.speed = 0;

    /***********************************************************
    ****************** Définition des méthodes *****************
    ***********************************************************/

    this.verifCollisionMurs = function(horizontal){
      if (this.x <= 0){
        this.stopMove();
        this.io.in(this.room).emit("goal",1,0);
      }
      if (this.x >= 770){
        this.stopMove();
        this.io.in(this.room).emit("goal",0,1);
      }
      if (this.y <= 0 || this.y >= 570) {
        this.dir = -this.dir;
        this.vx = Math.cos(this.dir)*this.speed;
        this.vy = Math.sin(this.dir)*this.speed;
      }
    };

    this.init = function(numeroJoueur){
      this.x = 225 + numeroJoueur * 330;
      this.y = 290;
      this.speed = 1;
      this.io.in(this.room).emit("afficherBalle",true);
      this.lancer(numeroJoueur);
    };

    this.lancer = function(numeroJoueur){
        this.speed = this.speed + 0.3;
        this.dir = (Math.random() - 0.5)*(Math.PI / 2) + Math.PI * numeroJoueur;
        this.vx = Math.cos(this.dir)*this.speed;
        this.vy = Math.sin(this.dir)*this.speed;
        //
        global.clearInterval(this.mouvement);
        this.mouvement = null;
        //
        this.mouvement = global.setInterval(
          function(){
            this.x = this.x + this.vx;
            this.y = this.y + this.vy;
            this.verifCollisionMurs();
            this.updatePosition();
          }.bind(this),10);
    };

    this.stopMove = function(){
      global.clearInterval(this.mouvement);
      this.mouvement = null;
      this.io.in(this.room).emit("afficherBalle",false);
    };

    this.updatePosition = function(){
      this.io.in(this.room).emit("positionBalle",this.x,this.y);
    };
  }
}
