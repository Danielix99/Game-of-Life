! function(Math){
    "use strict";

		//define and initialize canvas context
    var canvas = {  
		width:  0, 
		height: 0,
		rx: 1,
		ry: 1,
		elem: document.createElement('canvas'),
		resize: function () {
			var o = this.elem;
			this.offsetWidth = this.elem.offsetWidth * 1;
			this.offsetHeight = this.elem.offsetHeight * 1;
			if (this.width) {
				this.rx = this.width / this.offsetWidth;
				this.ry = this.height / this.offsetHeight;
			}
			for (this.left = 0, this.top = 0; o != null; o = o.offsetParent) {
				this.left += o.offsetLeft;
				this.top  += o.offsetTop;
			}
		},
		init: function () {
			var ctx = this.elem.getContext('2d');
			document.body.appendChild(this.elem);
			this.resize();
			this.width = this.elem.width = this.offsetWidth;
			this.height = this.elem.height = this.offsetHeight;
			window.addEventListener('resize', canvas.resize.bind(canvas), false);
			return ctx;
		}
		};

		var ctx = canvas.init();

		//define Cell
		var Cell = function(id, x, y, currentStatus = false){
			this.id = id;
			this.x = x;
			this.y = y;
			this.currStat = currentStatus;
			this.nextStat = false;
			this.nextToCurr = function(){
				this.currStat = this.nextStat;
				this.nextStat = false;
			};
			this.neighbors = function(){
				var n = 0;
				if(Grid.getCell(this.x-1,this.y) != false){if(Grid.getCell(this.x-1,this.y).currStat == 1){n++;}}
				if(Grid.getCell(this.x-1,this.y-1) != false){if(Grid.getCell(this.x-1,this.y-1).currStat == 1){n++;}}
				if(Grid.getCell(this.x,this.y-1) != false){if(Grid.getCell(this.x,this.y-1).currStat == 1){n++;}}
				if(Grid.getCell(this.x+1,this.y-1) != false){if(Grid.getCell(this.x+1,this.y-1).currStat == 1){n++;}}
				if(Grid.getCell(this.x+1,this.y) != false){if(Grid.getCell(this.x+1,this.y).currStat == 1){n++;}}
				if(Grid.getCell(this.x+1,this.y+1) != false){if(Grid.getCell(this.x+1,this.y+1).currStat == 1){n++;}}
				if(Grid.getCell(this.x,this.y+1) != false){if(Grid.getCell(this.x,this.y+1).currStat == 1){n++;}}
				if(Grid.getCell(this.x-1,this.y+1) != false){if(Grid.getCell(this.x-1,this.y+1).currStat == 1){n++;}}
				return n;
			};
			
		};
		//define and init the grid
		var Grid = {
			nGen: 0,
			Cells: [],
			Size: 12,
			Interval: 0,
			getSize: function(){ return this.Size; },
			setSize: function(n){ this.Size = n; },
			init: function(){
				var k = 0;
				for ( var x = 0; x < this.Size; x++ ) {
					for ( var y = this.Size-1; y >= 0; y-- ) {
						this.Cells.push( new Cell (k++, x, y, false) );
					}
				}
			},
			draw: function(){
				var CellWidth = canvas.width/this.Size;
				var CellHeight = CellWidth;

				function drawBorder(xPos, yPos, width, height, thickness = 1)
				{
  				ctx.fillStyle='black';
  				ctx.fillRect(xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2));
				}

				this.Cells.forEach(function(c){
					drawBorder(c.x * CellWidth, c.y * CellWidth, CellWidth, CellHeight);
					if(c.currStat){ctx.fillStyle = "green";}
					else{ctx.fillStyle = "grey";}
					ctx.fillRect(c.x * CellWidth, c.y * CellWidth, CellWidth, CellHeight);
				});
			},
			initLife: function(luck = this.Size*2){
       for (var c = 0; c < luck; c++){
				 this.Cells[Math.floor((this.Size*this.Size)*Math.random())].currStat = 1;
			 }
			},
			newGen: function(){
				this.Cells.forEach(function(c){
					var neigh = c.neighbors();
					if (neigh < 2 && c.currStat == 1){c.nextStat = 0;} //insulation effect
					if((neigh == 2 || neigh == 3) && c.currStat == 1){c.nextStat = 1;} //survive
					if(neigh > 3 && c.currStat == 1){c.nextStat = 0;} //overpopulation
					if(neigh == 3 && c.currStat == 0){c.nextStat = 1;} //reproduction		
				});
				this.Cells.forEach(function(c){
					c.nextToCurr();
				});
				
				this.draw();
				this.nGen++;
				document.title = "Game Of Life - Gen: "+this.nGen;
			},
			getCell: function(x,y){
				var rightCell = false;
				 this.Cells.some(function(c){
					if( c.x == x && c.y == y){rightCell = c; return true;}		
				});
				return rightCell;
			},
			reset: function(){
				clearInterval(this.Interval);
				this.nGen = 0;
				document.title = "Game Of Life - Gen: "+this.nGen;
				this.Cells = [];
				this.init();
				this.initLife();
				this.draw();
				this.Interval = setInterval(Grid.newGen.bind(Grid), 500);
			},
			start: function(){ if(this.Interval == 0) this.Interval = setInterval(Grid.newGen.bind(Grid), 500); },
			stop: function(){ clearInterval(this.Interval); this.Interval = 0;}
		};

		Grid.reset();

		//setup controlpanel
		dragElement(document.getElementById("cp"));

		function dragElement(elmnt) {
			var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
			if (document.getElementById(elmnt.id + "header")) {
				document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
			} else {
				elmnt.onmousedown = dragMouseDown;
			}
		
			function dragMouseDown(e) {
				e = e || window.event;
				e.preventDefault();
				pos3 = e.clientX;
				pos4 = e.clientY;
				document.onmouseup = closeDragElement;
				document.onmousemove = elementDrag;
			}
		
			function elementDrag(e) {
				e = e || window.event;
				e.preventDefault();
				pos1 = pos3 - e.clientX;
				pos2 = pos4 - e.clientY;
				pos3 = e.clientX;
				pos4 = e.clientY;
				elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
				elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
			}
		
			function closeDragElement() {
				document.onmouseup = null;
				document.onmousemove = null;
			}
		}
		document.getElementById('startGrid').addEventListener("click",function(){Grid.start.bind(Grid)();},false);
		document.getElementById('stopGrid').addEventListener("click",function(){Grid.stop.bind(Grid)();},false);
		document.getElementById('resetGrid').addEventListener("click",function(){Grid.reset.bind(Grid)();},false);
}(Math);
