import Component from '@ember/component';
// http://www.petercollingridge.co.uk/interactive-svg-components/draggable-svg-element

const REGEX = /\{(.+)\}/;

const LABEL_DATA_ATTRIBUTE = 'data-dragnet-label';

const DRAGGABLE_CLASS = 'dragnet__label';

function getX(index) {
  return 500;
}

function getY(index) {
  return 25 * (index + 1);
}

let detectOverlap = (function () {
    function getPositions(elem) {
        let pos = elem.getBoundingClientRect();
        return [[pos.left, pos.right], [pos.top, pos.bottom]];
    }

    function comparePositions(p1, p2) {
        let r1, r2;
        r1 = p1[0] < p2[0] ? p1 : p2;
        r2 = p1[0] < p2[0] ? p2 : p1;
        return r1[1] > r2[0] || r1[0] === r2[0];
    }

    return function (a, b) {
        let pos1 = getPositions(a),
            pos2 = getPositions(b);
        return comparePositions(pos1[0], pos2[0]) && comparePositions(pos1[1], pos2[1]);
    };
})();

function parseLabels(inputSVG, targetSVG) {
  inputSVG.querySelectorAll('text').forEach((text, i) => {
    let match = REGEX.exec(text.textContent);
    if (!match) { return; }
    let answer = match[1];
    text.textContent = "--";
    text.setAttribute(LABEL_DATA_ATTRIBUTE, answer);
    targetSVG.insertAdjacentHTML('beforeend', `<text transform="matrix(1 0 0 1 0 0)"
      class="${DRAGGABLE_CLASS}" x="${getX(i)}" y="${getY(i)}">${answer}</text>`);
  });
}

export default Component.extend({
  didInsertElement() {
    this._super(...arguments);

    let svg = this.element.querySelector('svg');
    parseLabels(svg, svg);
  },

  mouseDown(evt) {
    if (!evt.target.classList.contains(DRAGGABLE_CLASS)) {
      return;
    }

    this.selectedElement = evt.target;
    this.currentX = evt.clientX;
    this.currentY = evt.clientY;
    this.currentMatrix = this.selectedElement.getAttributeNS(null, "transform").slice(7,-1).split(' ');

    for(let i=0; i < this.currentMatrix.length; i++) {
      this.currentMatrix[i] = parseFloat(this.currentMatrix[i]);
    }
  },

  hovered() {
    let placeholders = Array.prototype.slice.call(this.element.querySelectorAll(`[${LABEL_DATA_ATTRIBUTE}]`));

    return placeholders.any(label => detectOverlap(label, this.selectedElement));
  },

  mouseMove(evt) {
    if (!this.selectedElement) { return; }

    let hovered = this.hovered();

    if (hovered) {
      console.log(`overlap ${hovered}`);
    }

    let dx = evt.clientX - this.currentX;
    let dy = evt.clientY - this.currentY;
    this.currentMatrix[4] += dx;
    this.currentMatrix[5] += dy;
    let newMatrix = "matrix(" + this.currentMatrix.join(' ') + ")";

    this.selectedElement.setAttributeNS(null, "transform", newMatrix);
    this.currentX = evt.clientX;
    this.currentY = evt.clientY;

  },

  resetPosition(target) {
    target.setAttributeNS(null, 'transform', 'matrix(1 0 0 1 0 0)');
  },

  mouseUp(evt) {
    if (!this.selectedElement) { return; }

    if (!this.hovered()) {
      this.resetPosition(this.selectedElement);
    }

    this.selectedElement = null;
  }

});
