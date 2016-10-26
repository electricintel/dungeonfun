// Generated by CoffeeScript 1.10.0

/*!
Infinite 2D graph data structure.

Uses the astar pathfinding algorithm from http://github.com/bgrins/javascript-astar
 */

(function() {
  var Graph, exports, heap;

  heap = require('./heap.coffee');

  Graph = (function() {
    function Graph(initial) {
      var l, m, ref, ref1, row, x, y;
      if (initial == null) {
        initial = null;
      }
      this.MAX_HEAP_SIZE = 500;
      this.map = {};
      if (initial) {
        for (y = l = 0, ref = initial.length - 1; 0 <= ref ? l <= ref : l >= ref; y = 0 <= ref ? ++l : --l) {
          row = initial[y];
          for (x = m = 0, ref1 = row.length - 1; 0 <= ref1 ? m <= ref1 : m >= ref1; x = 0 <= ref1 ? ++m : --m) {
            this.set(x, y, initial[y][x]);
          }
        }
      }
    }

    Graph.prototype.get = function(x, y) {
      var ref;
      return ((ref = this.map[x]) != null ? ref[y] : void 0) || 0;
    };

    Graph.prototype.getPoint = function(p) {
      return this.get(p[0], p[1]);
    };

    Graph.prototype.set = function(x, y, value) {
      var a;
      a = this.map[x];
      if (a == null) {
        a = this.map[x] = {};
      }
      return a[y] = value;
    };

    Graph.prototype.setPoint = function(p, value) {
      return this.set(p[0], p[1], value);
    };

    Graph.prototype.clear = function(x, y) {
      var a;
      a = this.map[x];
      if (a) {
        return delete a[y];
      }
    };

    Graph.prototype.getRect = function(x, y, w, h) {
      var j, k, l, m, ref, ref1, ref2, ref3, result, row;
      result = [];
      for (k = l = ref = y, ref1 = y + h - 1; ref <= ref1 ? l <= ref1 : l >= ref1; k = ref <= ref1 ? ++l : --l) {
        row = [];
        for (j = m = ref2 = x, ref3 = x + w - 1; ref2 <= ref3 ? m <= ref3 : m >= ref3; j = ref2 <= ref3 ? ++m : --m) {
          row.push(this.get(j, k));
        }
        result.push(row);
      }
      return result;
    };

    Graph.prototype.neighborPoints = function(x, y, includeDiagonals) {
      if (includeDiagonals == null) {
        includeDiagonals = true;
      }
      if (includeDiagonals) {
        return [[x - 1, y - 1], [x, y - 1], [x + 1, y - 1], [x - 1, y], [x + 1, y], [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]];
      } else {
        return [[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]];
      }
    };

    Graph.prototype.neighbors = function(x, y, includeDiagonals) {
      var i, j;
      if (includeDiagonals == null) {
        includeDiagonals = true;
      }
      return (function() {
        var l, len, ref, ref1, results;
        ref = this.neighborPoints(x, y, includeDiagonals);
        results = [];
        for (l = 0, len = ref.length; l < len; l++) {
          ref1 = ref[l], i = ref1[0], j = ref1[1];
          results.push(this.get(i, j));
        }
        return results;
      }).call(this);
    };

    Graph.prototype.astar = function(x1, y1, x2, y2, filter, heuristic, includeDiagonals) {
      var beenVisited, current, end, gScore, getNode, l, len, n, neighbor, nodes, open, p, ref, ret, start;
      if (filter == null) {
        filter = null;
      }
      if (heuristic == null) {
        heuristic = null;
      }
      if (includeDiagonals == null) {
        includeDiagonals = false;
      }
      nodes = {};
      getNode = (function(_this) {
        return function(x, y) {
          var key;
          key = x + ',' + y;
          return nodes[key] || (nodes[key] = {
            x: x,
            y: y,
            value: _this.get(x, y)
          });
        };
      })(this);
      start = getNode(x1, y1);
      end = getNode(x2, y2);
      filter || (filter = function(node) {
        return node.value > 0;
      });
      heuristic || (heuristic = function(n1, n2) {
        var d1, d2;
        d1 = Math.abs(n2.x - n1.x);
        d2 = Math.abs(n2.y - n1.y);
        return d1 + d2;
      });
      open = new heap.BinaryHeap(function(node) {
        return node.f;
      });
      open.push(start);
      while (open.size() > 0 && open.size() < this.MAX_HEAP_SIZE) {
        current = open.pop();
        if (current === end) {
          n = current;
          ret = [];
          while (n.parent) {
            if (n !== end) {
              ret.push([n.x, n.y]);
            }
            n = n.parent;
          }
          return ret.reverse();
        }
        current.closed = true;
        ref = this.neighborPoints(current.x, current.y, includeDiagonals);
        for (l = 0, len = ref.length; l < len; l++) {
          p = ref[l];
          neighbor = getNode(p[0], p[1]);
          if (neighbor.closed || !filter(neighbor)) {
            continue;
          }
          gScore = (current.g || 0) + 1;
          beenVisited = neighbor.visited;
          if (!beenVisited || gScore < (neighbor.g || 0)) {
            neighbor.visited = true;
            neighbor.parent = current;
            neighbor.h || (neighbor.h = heuristic(neighbor, end));
            neighbor.g = gScore;
            neighbor.f = neighbor.g + neighbor.h;
            if (!beenVisited) {
              open.push(neighbor);
            } else {
              open.rescoreElement(neighbor);
            }
          }
        }
      }
      return [];
    };

    return Graph;

  })();

  if (typeof exports === "undefined" || exports === null) {
    exports = this;
  }

  exports.Graph = Graph;

}).call(this);
