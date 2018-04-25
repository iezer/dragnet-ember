import Component from '@ember/component';

const REGEX = /\{(.+)\}/;

function parseLabels(inputSVG, targetSVG) {
  inputSVG.querySelectorAll('text').forEach((text, i) => {
    let match = REGEX.exec(text.textContent);
    if (!match) { return; }
    let answer = match[1];
    text.textContent = "--";
    text.setAttribute('data-dragnet-label', answer);
    targetSVG.insertAdjacentHTML('beforeend', `<text x="0" y="${25 * (i + 1)}">${answer}</text>`);
  });
}

export default Component.extend({

  didInsertElement() {
    this._super(...arguments);

    let svg = this.element.querySelector('svg');
    parseLabels(svg, svg);
  }
});