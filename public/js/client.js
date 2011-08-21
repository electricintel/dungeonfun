(function() {
  var BGCOLOR, CELL_HEIGHT, CELL_WIDTH, SCROLL_PADDING, SPRITE_BG, SPRITE_SIZE, Viewport, log, spritemap, str;
  log = function() {
    return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log(Array.prototype.slice.call(arguments)) : void 0 : void 0;
  };
  str = function(x) {
    return JSON.stringify(x);
  };
  BGCOLOR = 'black';
  SPRITE_SIZE = 16;
  SPRITE_BG = '#476c6c';
  spritemap = new Image();
  spritemap.src = '/images/nhtiles.png';
  CELL_WIDTH = 16;
  CELL_HEIGHT = 16;
  SCROLL_PADDING = 70;
  Viewport = (function() {
    function Viewport(canvas) {
      this.canvas = canvas;
      this.set(0, 0);
    }
    Viewport.prototype.set = function(x, y) {
      this.l = x;
      this.t = y;
      this.r = x + Math.floor(this.canvas.width / CELL_WIDTH) + 1;
      return this.b = y + Math.floor(this.canvas.height / CELL_HEIGHT) + 1;
    };
    Viewport.prototype.translate = function(x, y) {
      return this.set(this.l + x, this.t + y);
    };
    Viewport.prototype.xToCanvasX = function(x) {
      return (x - this.l) * CELL_WIDTH;
    };
    Viewport.prototype.yToCanvasY = function(y) {
      return (y - this.t) * CELL_HEIGHT;
    };
    return Viewport;
  })();
  $(function() {
    var body, canvas, ctx, drawCell, drawPlayer, drawSprite, fullRedraw, i, j, mypid, onUpdate, p, players, socket, v, w, _results;
    body = $(document.body);
    body.css({
      overflow: 'hidden'
    });
    canvas = document.getElementById('canvas');
    canvas.width = document.width;
    canvas.height = document.height;
    ctx = typeof canvas.getContext === "function" ? canvas.getContext('2d') : void 0;
    ctx.fillStyle = BGCOLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    v = new Viewport(canvas);
    w = new World();
    p = new Graph();
    players = {};
    mypid = null;
    drawSprite = function(sx, sy, dx, dy) {
      var S;
      S = SPRITE_SIZE;
      return ctx.drawImage(spritemap, sx * S, sy * S, S, S, dx, dy, CELL_WIDTH, CELL_HEIGHT);
    };
    drawCell = function(x, y, dx, dy) {
      var W, i, n, sx, sy, value;
      value = w.map.get(x, y);
      W = w.CELL_WALL;
      switch (value) {
        case W:
          sy = 20;
          n = (function() {
            var _i, _len, _ref, _results;
            _ref = w.map.neighbors(x, y, false);
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              i = _ref[_i];
              _results.push(i === W);
            }
            return _results;
          })();
          if (n[0] && n[1] && n[2] && n[3]) {
            sx = 34;
          } else if (n[0] && n[3]) {
            sx = 30;
          } else if (n[1] && n[2]) {
            sx = 31;
          } else if (n[3]) {
            sx = 32;
          } else {
            sx = 34;
          }
          break;
        case w.CELL_ROOM:
          sx = 8;
          sy = 21;
          break;
        case w.CELL_DOOR:
          sx = 2;
          sy = 21;
          break;
        case w.CELL_HALLWAY:
          sx = 9;
          sy = 21;
          break;
        default:
          sx = 39;
          sy = 29;
      }
      return drawSprite(sx, sy, dx, dy);
    };
    fullRedraw = function() {
      var dx, dy, p, pid, x, y, _ref, _ref2, _ref3, _ref4, _results;
      for (x = _ref = v.l, _ref2 = v.r; _ref <= _ref2 ? x <= _ref2 : x >= _ref2; _ref <= _ref2 ? x++ : x--) {
        for (y = _ref3 = v.t, _ref4 = v.b; _ref3 <= _ref4 ? y <= _ref4 : y >= _ref4; _ref3 <= _ref4 ? y++ : y--) {
          dx = (x - v.l) * CELL_WIDTH;
          dy = (y - v.t) * CELL_HEIGHT;
          drawCell(x, y, dx, dy);
        }
      }
      _results = [];
      for (pid in players) {
        p = players[pid];
        _results.push(drawPlayer(p));
      }
      return _results;
    };
    drawPlayer = function(p, oldx, oldy) {
      if (oldx == null) {
        oldx = null;
      }
      if (oldy == null) {
        oldy = null;
      }
      drawSprite(15 + (p.id % 14), 8, v.xToCanvasX(p.x), v.yToCanvasY(p.y));
      if (oldx !== null && oldy !== null) {
        return drawCell(oldx, oldy, v.xToCanvasX(oldx), v.yToCanvasY(oldy));
      }
    };
    socket = io.connect('/');
    socket.on('connected', function(socket) {
      return log('connected', socket);
    });
    socket.on('tile', function(data) {
      log('received tile', data.x, data.y);
      w.loadTile(data.x, data.y, data.content);
      return fullRedraw();
    });
    socket.on('allPlayers', function(data) {
      var p, pid;
      for (pid in data) {
        p = data[pid];
        players[p.id] = p;
      }
      return fullRedraw();
    });
    onUpdate = function(p) {
      var P, T, animate, dx, dy, imageData, oldp, step, steps, time, tx, ty, vx, vy;
      oldp = players[p.id];
      players[p.id] = p;
      if (oldp) {
        drawPlayer(p, oldp.x, oldp.y);
        if (p.id === mypid) {
          vx = v.xToCanvasX(p.x);
          vy = v.yToCanvasY(p.y);
          P = SCROLL_PADDING;
          T = Math.floor(SCROLL_PADDING / CELL_WIDTH * 2);
          tx = ty = 0;
          if (vx < P) {
            tx = -T;
          }
          if (vx > v.canvas.width - P) {
            tx = T;
          }
          if (vy < P) {
            ty = -T;
          }
          if (vy > v.canvas.height - P) {
            ty = T;
          }
          if (tx || ty) {
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            steps = 5;
            time = 100;
            dx = -tx * CELL_WIDTH / steps;
            dy = -ty * CELL_HEIGHT / steps;
            step = 0;
            animate = function() {
              step++;
              ctx.fillStyle = BGCOLOR;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.putImageData(imageData, dx * step, dy * step);
              if (step < steps) {
                return setTimeout(animate, time / steps);
              } else {
                v.translate(tx, ty);
                return fullRedraw();
              }
            };
            return animate();
          }
        }
      } else {
        return fullRedraw();
      }
    };
    socket.on('playerUpdate', onUpdate);
    socket.on('newPlayer', onUpdate);
    socket.on('you', function(p) {
      return mypid = p.id;
    });
    socket.on('removePlayer', function(p) {
      delete players[p.id];
      return fullRedraw();
    });
    $(document).bind('keydown', function(e) {
      switch (String.fromCharCode(e.which)) {
        case 'H':
          socket.emit('movePlayer', {
            direction: 'w'
          });
          break;
        case 'L':
          socket.emit('movePlayer', {
            direction: 'e'
          });
          break;
        case 'J':
          socket.emit('movePlayer', {
            direction: 's'
          });
          break;
        case 'K':
          socket.emit('movePlayer', {
            direction: 'n'
          });
          break;
        case 'Y':
          socket.emit('movePlayer', {
            direction: 'nw'
          });
          break;
        case 'U':
          socket.emit('movePlayer', {
            direction: 'ne'
          });
          break;
        case 'B':
          socket.emit('movePlayer', {
            direction: 'sw'
          });
          break;
        case 'N':
          socket.emit('movePlayer', {
            direction: 'se'
          });
      }
      if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        return false;
      }
    });
    log('welcome');
    _results = [];
    for (i = -1; i <= 1; i++) {
      _results.push((function() {
        var _results2;
        _results2 = [];
        for (j = -1; j <= 1; j++) {
          _results2.push(socket.emit('getTile', {
            x: i,
            y: j
          }));
        }
        return _results2;
      })());
    }
    return _results;
  });
}).call(this);
