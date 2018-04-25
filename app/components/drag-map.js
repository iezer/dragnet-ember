import Component from '@ember/component';
// http://www.petercollingridge.co.uk/interactive-svg-components/draggable-svg-element
const REGEX = /\{(.+)\}/;

function parseLabels(inputSVG, targetSVG) {
  inputSVG.querySelectorAll('text').forEach((text, i) => {
    let match = REGEX.exec(text.textContent);
    if (!match) { return; }
    let answer = match[1];
    text.textContent = "--";
    text.setAttribute('data-dragnet-label', answer);
    targetSVG.insertAdjacentHTML('beforeend', `<text transform="matrix(1 0 0 1 0 0)"
 class="dragnet__draggable" x="0" y="${25 * (i + 1)}">${answer}</text>`);
  });
}

export default Component.extend({
  didInsertElement() {
    this._super(...arguments);

    let svg = this.element.querySelector('svg');
    parseLabels(svg, svg);
  },

  mouseDown(evt) {
    if (!evt.target.classList.contains('dragnet__draggable')) {
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

  mouseMove(evt) {
    if (!this.selectedElement) { return; }
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
    this.resetPosition(this.selectedElement);
    this.selectedElement = null;
  }

});
