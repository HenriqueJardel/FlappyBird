// Chama quando o DOM está pronto
window.onload = function() {
    
    const canvas = document.getElementById("Mycanvas");
    const ctx = canvas.getContext("2d");
    
    const sprite = new Image();
    sprite.src = "img/sprite.png";
    var frames = 0;
    
    const ponto_s = new Audio();
    ponto_s.src = "audio/ponto.wav";

    const voar_s = new Audio();
    voar_s.src = "audio/voar.wav";

    const morte_s = new Audio();
    morte_s.src = "audio/morte.wav";

    const colisao_s = new Audio();
    colisao_s.src = "audio/colisão.wav";

    //Controlador dos estados da aplicação.
    const Estado = {
        atual: 0,
        incial: 0,
        jogando: 1,
        over: 2
    }

    const passaro = {
        anima : [
            {sx:276,sy:112},
            {sx:276,sy:139},
            {sx:276,sy:164},
            {sx:276,sy:139} 
        ],
        
        x:50,
        y:150,
        w:34,
        h:26,

        frame: 0,
        velocidade: 0,
        gravidade: 0.25,
        pulo: 10,
        raio: 12,
        
        Voar : function() {
            this.velocidade -= this.pulo;
        },

        Update : function() {
            var i = Estado.atual == Estado.incial ? 10 : 5;
            if (frames % i == 0) {
                if (this.frame < this.anima.length - 1)
                    this.frame += 1;
                else
                    this.frame = 0;
            }
            
            if (Estado.atual == Estado.incial) 
                this.y = 150
            
            else {
                this.velocidade += this.gravidade;
                this.y += this.velocidade;

                if (this.y + this.h/2 >= canvas.height - Chao.h) {
                    this.y = canvas.height - Chao.h - this.h/2;
                    if (Estado.atual == Estado.jogando) {
                        morte_s.play();
                        Estado.atual = Estado.over;
                    }
                }

                if (this.y <= 0)
                    this.y = this.h;
            }
            
        },
        
        Paint : function() {
            let passaro = this.anima[this.frame];
            ctx.drawImage(sprite,passaro.sx,passaro.sy,this.w,this.h,this.x - this.w/2,this.y - this.h/2,this.w, this.h);
        },
        
    }

    const Obstaculo = {
        baixo : {
            sx: 502,
            sy: 0
        },

        cima : {
            sx: 553,
            sy: 0
        },
        
        w : 53,
        h : 400,
        velocidadex : 2,
        pos : [],
        passagem: 115,
       
        Paint : function() {
            for (var i = 0 ; i < this.pos.length;i++) {
                let obs = this.pos[i];
                let posYcima = obs.y;
                let posYbaixo = obs.y + this.h + this.passagem;
                ctx.drawImage(sprite,this.baixo.sx,this.baixo.sy,this.w,this.h,obs.x,posYbaixo,this.w, this.h);
                ctx.drawImage(sprite,this.cima.sx,this.cima.sy,this.w,this.h,obs.x,posYcima,this.w, this.h);
            }
        },

        //Responsável por colocar novos obstáculos. 
        Update : function(){
            if(Estado.atual == Estado.jogando) {
                if (frames % 200 == 0) {
                    this.pos.push({
                        x: canvas.width,
                        y: - 150 * (Math.random() + 1)
                    });
                }
            }
 
            for (var i = 0 ; i < this.pos.length;i++) {
                if (Estado.atual == Estado.jogando) {
                    let obs = this.pos[i];
                    obs.x--;
                    let obsBaixo = obs.y + this.h + this.passagem;

                    // Colisões
                    if (passaro.x + passaro.raio > obs.x && passaro.x - passaro.raio < obs.x + this.w 
                        && passaro.y + passaro.raio > obs.y && passaro.y - passaro.raio < obs.y + this.h) {
                            colisao_s.play();
                            Estado.atual = Estado.over;
                            
                    }

                    if (passaro.x + passaro.raio > obs.x && passaro.x - passaro.raio < obs.x + this.w 
                        && passaro.y + passaro.raio > obsBaixo && passaro.y - passaro.raio < obsBaixo + this.h) {
                            colisao_s.play();
                            Estado.atual = Estado.over;
                    }

                    //Retira os obstáculos que sairem da tela e incrementa a pontuação do jogador.
                    if(obs.x + this.w <= 0) {
                        this.pos.shift();
                        Pontos.atual++;
                        ponto_s.play();

                        Pontos.melhor = Math.max(Pontos.atual,Pontos.melhor);
                        localStorage.setItem("melhor", Pontos.melhor);
                    }
                }

                //Retira todos os obstáculos da lista assim que o jogo reseta.
                if(Estado.atual == Estado.incial)
                    this.pos.pop();
                

            }
            
        }
    }

    const TelaIncial = {
        sx: 0,
        sy: 228,
        w: 173,
        h: 152,
        x: canvas.width/2 - 173/2,
        y: 70,

        Paint : function() {
            if(Estado.atual == Estado.incial)
                ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x,this.y,this.w,this.h);
        }
    }
    
    const GameOver = {
        sx: 175,
        sy: 228,
        w: 225,
        h: 202,
        x: canvas.width/2 - 225/2,
        y: 110,

        Paint : function() {
            if(Estado.atual == Estado.over)
                ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x,this.y,this.w,this.h);
        }
    }

    const Fundo = {
        sx: 0,
        sy: 0,
        w: 275,
        h: 226,
        x: 0,
        y: canvas.height-226,

        Paint : function() {
            ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x,this.y,this.w,this.h);
            ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x + 275,this.y,this.w,this.h);
        }
    }

    const Chao = {
        sx: 276,
        sy: 0,
        w: 224,
        h: 112,
        x: 0,
        y: canvas.height-112,
        
        Paint : function() {
            ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x,this.y,this.w,this.h);
            ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x + 224,this.y,this.w,this.h);
            ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x + 448,this.y,this.w,this.h);
        },

        //Responsavel pelo movimento do chão
        Update : function(){
            
            if(Estado.atual == Estado.jogando) {
                if (this.x < -150)
                {
                    this.x = 0;
                }
                this.x-=2;
            }
                
        }
    }

    const Pontos = {
        melhor: parseInt(localStorage.getItem("melhor")) || 0,
        atual: 0,


        Paint : function(){
            ctx.fillStyle = "#FFF";
            ctx.strokeStyle = "#000";

            if (Estado.atual == Estado.jogando)
            {
                ctx.lineWidth = 2;
                ctx.font = "35px Teko";
                ctx.fillText(this.atual, canvas.width/2 - 17.5 , 50);
            }

            if (Estado.atual == Estado.over)
            {
                ctx.font = "25px Teko";
                ctx.fillText(this.atual,310,208);    
                ctx.strokeText(this.atual,310,208);
                ctx.fillText(this.melhor,310,250);
                ctx.strokeText(this.melhor,310,250);
            }
        },

        Update : function(){

        }
    }

    // Ouve as entradas do mouse do usuário.
    canvas.addEventListener("click",function(ewt) {
        switch(Estado.atual)
        {
            case Estado.incial:
                Estado.atual = Estado.jogando;
                Pontos.atual = 0;
                passaro.velocidade = 0;
                break;
            case Estado.jogando:
                passaro.Voar();
                voar_s.play();
                break;
            case Estado.over:
                Estado.atual = Estado.incial;
                break;
                
        }
    })


    function Paint() {
        ctx.fillStyle = "deepskyblue"
        ctx.fillRect(0,0,canvas.width,canvas.height);

        Fundo.Paint();
        Obstaculo.Paint();
        Chao.Paint();
        passaro.Paint();
        TelaIncial.Paint();
        GameOver.Paint();
        Pontos.Paint();
    }

    function Update() {
        passaro.Update();
        Chao.Update();
        Obstaculo.Update();
    }
 
    function GameLoop() {
        Paint();
        Update();
        requestAnimationFrame(GameLoop);
        frames++;
    }
    GameLoop();
}