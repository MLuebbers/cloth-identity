let canvasNum = 0

let clothSketch = function(p) {
    let WIDTH = 640;
    let HEIGHT = 120;
    let SCALE = 5;
    let SPEED = 100;

    let menu;
    let height_map;
    let cloth;
    p.setup = function() {
        
        p.createCanvas(1280, HEIGHT+SCALE, p.WEBGL);
        p.frameRate(60);
        
        height_map = new HeightMap(WIDTH, HEIGHT, SCALE);
        cloth = new Cloth(0,0, WIDTH, HEIGHT, 10, SCALE, 1, 10, p.createVector(30, 5, 20), height_map);
        menu = new Menu();
        p.ortho(-p.width / 2, p.width / 2, -p.height / 2, p.height / 2, 0,500);
    }

    p.draw = function() {
        p.background(211);
        p.translate(-WIDTH,-HEIGHT/2);  
        p.rotateY(p.PI/180*p.noise(p.frameCount/SPEED)*15);
        cloth.display();
    }

    function Cloth(x, y, w, h, depth, interval, loopFactor, stiffnessFactor, noiseFactor, heightMap) {
        this.x = y;
        this.y = y;
        this.w = w;
        this.h = h;
        this.interval = interval;
        this.lf = loopFactor;
        this.sf = stiffnessFactor;
        this.nf = noiseFactor;
        this.hm = heightMap;
        this.d = depth;

        this.display = function() {
            p.noFill();
            p.stroke(0, 0, 255);
            for(let i = 0; i < this.w/this.interval; i ++){
                p.beginShape(p.TRIANGLE_STRIP);
                
                    for(let j = 0; j < this.h/this.interval; j ++){
                        p.vertex(this.x + 0, this.y + j * this.interval, this.hm.getHeight(i, j)*this.d + this.getNoise(i, j));
                        p.vertex(this.x + this.interval, this.y + j * this.interval, this.hm.getHeight(i + 1, j)*this.d + this.getNoise(i + 1, j));
            
                    }
                p.endShape();
                p.translate(this.interval, 0);
                p.rotateY(this.getDeltaAngle(i));
            }     
            
        }

        this.getDeltaAngle = function(x) {
            return p.PI/180 * p.map(p.noise((p.frameCount/SPEED - ((x)/this.sf)), 0), 0.0, 1.0, -1.0, 1.0) * this.lf;
        }
        this.getNoise = function(x, y) {
            return p.noise((x  + p.frameCount/this.nf.x)/this.nf.y , (y  + p.frameCount/this.nf.x)/this.nf.y) * this.nf.z;
        }
    }

    function HeightMap(w, h, interval) {
        this.h = h;
        this.w = w;
        this.interval = interval;
        this.displacement = p.createGraphics(w, h);
        this.displacement.textSize(128);
        this.displacement.text((()=>{
            let s = "";
            for(let i = 0; i < 26; i ++){
                s += String.fromCharCode(Math.floor(Math.random() * 16)+ 65);
            }
            return s;
        })(),0,100);
        this.mapping = (() => {
            let m  = [];
            for(let j = 0; j < this.h/this.interval; j ++) {
                for(let i = 0; i < this.w/this.interval; i ++) {
                    m.push(p.map(this.displacement.get(i * this.interval,j * this.interval)[3], 0, 255, 0, 1));
                }
            }
            return Object.seal(m);
        })();

        this.display = function() {
            p.image(this.displacement, 0, 0);
        }

        this.getHeight = function(x, y) {
            return this.mapping[(y * (this.w/this.interval)) + x];
        }
    }

    function Menu() {
        this.in_width = p.createInput('Width');
        this.in_scale  = p.createInput('Scale');
        this.in_depth  = p.createInput('Depth');
        this.in_speed = p.createInput('Speed');
        this.in_loopFactor = p.createInput('Loop Factor');
        this.in_stiffnessFactor = p.createInput('Stiffness Factor');
        this.in_noiseFactor_speed = p.createInput('Noise Factor (Speed)');
        this.in_noiseFactor_blend = p.createInput('Noise Factor (Blend)');
        this.in_noiseFactor_depth = p.createInput('Noise Factor (Depth)');
        this.new_cloth = p.createButton("New");
        this.new_cloth.mousePressed(() => {
            $("#sketch-container").append(`<div id="c${canvasNum}"></div>`);
            new p5(clothSketch, `c${canvasNum}`);
            canvasNum ++;
            this.new_cloth.remove();
        });
        this.in_width.input(() => {if(Number.isInteger(Number.parseInt(this.in_width.value())) && this.in_width.value() > 0){
            cloth.w = this.in_width.value()}});
        this.in_scale.input(() => {if(Number.isInteger(Number.parseInt(this.in_scale.value())) && this.in_scale.value() > 0){
            cloth.interval = this.in_scale.value()}});
        this.in_depth.input(() => {if(Number.isInteger(Number.parseInt(this.in_depth.value())) && this.in_depth.value() > 0){cloth.d = this.in_depth.value()}});
        this.in_speed.input(() => {if(Number.isInteger(Number.parseInt(this.in_speed.value())) && this.in_speed.value() > 0){SPEED = this.in_speed.value()}});
        this.in_loopFactor.input(() => {if(Number.isInteger(Number.parseInt(this.in_loopFactor.value())) && this.in_loopFactor.value() > 0){cloth.lf = this.in_loopFactor.value()}});
        this.in_stiffnessFactor.input(() => {if(Number.isInteger(Number.parseInt(this.in_stiffnessFactor.value())) && this.in_stiffnessFactor.value() > 0){cloth.sf = this.in_stiffnessFactor.value()}});
        this.in_noiseFactor_speed.input(() => {if(Number.isInteger(Number.parseInt(this.in_noiseFactor_speed.value())) && this.in_noiseFactor_speed.value() > 0){cloth.nf.x = this.in_noiseFactor_speed.value()}});
        this.in_noiseFactor_blend.input(() => {if(Number.isInteger(Number.parseInt(this.in_noiseFactor_blend.value())) && this.in_noiseFactor_blend.value() > 0){cloth.nf.y = this.in_noiseFactor_blend.value()}});
        this.in_noiseFactor_depth.input(() => {if(Number.isInteger(Number.parseInt(this.in_noiseFactor_depth.value())) && this.in_noiseFactor_depth.value() > 0){cloth.nf.z = this.in_noiseFactor_depth.value()}});

    }
}

new p5(clothSketch, `c${canvasNum}`);
