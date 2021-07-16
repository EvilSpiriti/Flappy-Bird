// Выбранные cvs
var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

//Игровые переменные и изображения
let frames = 0;
const radius = Math.PI/180;

//Загрузка спрайтов
const sprite = new Image();
sprite.src = "img/sprite.png"

//загрузка звуков
const score_s = new Audio();
score_s.src = "audio/money.mp3";

const die = new Audio();
die.src = "audio/die.mp3";

const hit = new Audio();
hit.src = "audio/hit.mp3";

const flap_s = new Audio();
flap_s.src = "audio/flap.mp3";

const show = new Audio();
show.src = "audio/show.mp3";

//Экраны игры
const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

//крнпка старт игры
const startBtn = {
    x : 120,
    y : 263,
    w : 83,
    h : 29,
}

//Фуекции конторя процесса игры
cvs.addEventListener("click", function(evt){
switch(state.current){
    case state.getReady:
        state.current = state.game;
        show.play();
        break;
    case state.game:
        bird.flap();
        flap_s.play();
        break;
    case state.over:
        let rect = cvs.getBoundingClientRect();
        let clickX = evt.clientX - rect.left;
        let clickY = evt.clientY - rect.top;

        //проверка нажатия кнопки старт
        if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >=
        startBtn.y && clickY <= startBtn.y + startBtn.h){
            pipes.reset();
            score.reset();
            state.current = state.getReady;
        }
        break;
}
});

//Задний фон
const bg = {
    sX : 0,
    sY : 0,
    w : 275,
    h : 226,
    x : 0,
    y : cvs.height - 226,

    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x , this.y,
        this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y,
        this.w, this.h);
    }
}

//Земля
const fg = {
    sX : 276,
    sY : 0,
    w : 224,
    h : 112,
    x : 0,
    y : cvs.height - 112,

    dx : 2,

    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x , this.y,
        this.w, this.h);
    
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y,
        this.w, this.h);
    }, 

    update : function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx)%(this.w/2);
        }
    }

}

//Птичка
const bird = {
   animation : [
        {sX: 276,sY: 112},
        {sX: 276,sY: 139},
        {sX: 276,sY: 164},
        {sX: 276,sY: 139}
   ],
   x: 50,
   y: 150,
   w: 34,
   h: 26,

   radius : 12,

   frame : 0,

   gravity : 0.1,
   jump : 3,
   speed : 0,
   rotation : 0,

   draw : function(){
    let bird = this.animation[this.frame];

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w/2, - this.h/2, 
        this.w, this.h);

    ctx.restore();
   },

   flap : function(){
        this.speed = - this.jump;
   },

   update : function(){
       //если в игре находимся на экране готово , то птичка двигаетеся медленно
        this.period = state.current == state.getReady ? 10 : 5;
        //инкримент кадра изменяем на 1
        this.frame += frames%this.period == 0 ? 1 : 0;
        //меняем кадры от 0 до 4, а потом заново выставляем на 0
        this.frame = this.frame%this.animation.length;

        if(state.current == state.getReady){
            //возвращаем позицию птички при повторном запуске игры из-за проигрыша
            this.y = 150;
            //убирает баг с быстрым падением птички
            this.speed = 0;
            this.rotation = 0 * radius;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;

            if(this.y + this.h/2 >= cvs.height - fg.h){
                this.y = cvs.height - fg.h - this.h/2
                if(state.current == state.game){
                    state.current = state.over;
                    die.play();
                }
            }
            //Если скорость больше или равно прыжку, то птичка падает и наоборот
            if(this.speed >= this.jump){
                this.rotation = 90 * radius;
                this.frame = 1;
            }else{
                this.rotation = -25 * radius;
            }
        }
   }


}

//Сообщение готово
const getReady = {
    sX : 0,
    sY : 228, 
    w : 173,
    h : 152,
    x : cvs.width/2 - 173/2,
    y : 80,
    
    draw : function(){
        if(state.current == state.getReady){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x , this.y,
        this.w, this.h);
        }
    }
}

//Сообщение конец игры
const gameOver = {
    sX : 175,
    sY : 228, 
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,

    draw : function(){
        if(state.current == state.over){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x , this.y,
        this.w, this.h);
        }
    }
}

//Препятствия
const pipes = {
    position : [],

    top : {
        sX : 553,
        sY : 0
    },
    bottom : {
        sX : 502,
        sY : 0
    },

    w : 53,
    h : 400,
    gap : 85,
    maxYPos : -150,
    dx : 2,
    
    draw : function(){
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            //верхнее препятствие
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos,
            this.w, this.h)

            //нижнее препятствие
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos,
            this.w, this.h)
        }
    },
    //Появление новых препятствий 
    update : function(){
        if(state.current !== state.game) return;

        if(frames%100 == 0){
            this.position.push({
                x : cvs.width,
                y : this.maxYPos * (Math.random() +1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];

            
            let bottomPipeYPos = p.y + this.h + this.gap;

            //отслеживание столкновений
            //верхнее препятствие
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w &&
            bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
                state.current = state.over;
                hit.play();
            }
            //нижнее препятствие
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && 
            bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius <
            bottomPipeYPos + this.h){
                state.current = state.over;
                hit.play();
            }
            //левая часть нижнего препятствия
            p.x -= this.dx;
            //если препятствие выходит за зону canvas, тогда оно удалятся с поля видимости
            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                score_s.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },
    reset : function(){
        this.position = [];
    }
}
//счет
const score = {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,
    
    draw : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        
        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "45px Teko";
            ctx.fillText("Счет: ", 10, 500);
            ctx.strokeText("Счет: ", 10, 500);
            ctx.fillText(score.value, 120, 500);
            ctx.strokeText(score.value, 120, 500);
            
        }else if(state.current == state.over){
            // вывод счета
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 200, 186);
            ctx.strokeText(this.value, 200, 186);
            // лучший счет
            ctx.fillText(this.best, 200, 228);
            ctx.strokeText(this.best, 200, 228);
        }
        if(this.value >= 10 && this.value <= 24){
            medal1.draw();
        }else if(this.value >= 25 && this.value <= 49){
            medal2.draw();
        }else if(this.value >= 50 && this.value <= 69){
            medal3.draw();
        }else if(this.value >= 70){
            medal4.draw();
        }
    },
    
    reset : function(){
        this.value = 0;
    }
}

//медаль серебро
const medal1 = {
    sX : 313,
    sY : 113, 
    w : 46,
    h : 44,
    x : 60,
    y : cvs.height/2 - 80,

    draw : function(){
        if(state.current == state.over){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x , this.y,
            this.w, this.h);
        }
    }
}

//медаль темное серебро
const medal2 = {
    sX : 360,
    sY : 113,
    w : 46,
    h : 44,
    x : 60,
    y : cvs.height/2 - 80,

    draw : function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x , this.y,
            this.w, this.h); 
        } 
    }
}

//медаль светлое золото
const medal3 = {
    sX : 313,
    sY : 158, 
    w : 46,
    h : 44,
    x : 60,
    y : cvs.height/2 - 80,

    draw : function(){
        if(state.current == state.over){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x , this.y,
            this.w, this.h);
        }
    }
}

//медаль темно золотая
const medal4 = {
    sX : 360,
    sY : 158,
    w : 46,
    h : 44,
    x : 60,
    y : cvs.height/2 - 80,

    draw : function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x , this.y,
            this.w, this.h); 
        } 
    }
}

//Отрисовка
function draw(){
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.clientWidth, cvs.height);

    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

//Обновление
function update(){
    bird.update();
    fg.update();
    pipes.update();
}

//Цикл
function loop(){
    update();
    draw();
    frames++;  

    requestAnimationFrame(loop);
}

loop();
