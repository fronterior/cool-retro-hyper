import type React from "react"

export function decorateHyper(
  Terms: React.Component,
  { React }
) {
  return class extends React.Component {
    static {
      console.log('Init cool-retro-hyper!')
    }

    constructor(props: Record<string, unknown>, context: Record<string, unknown>) {
      super(props, context);
      this.terms = null;
      this.onDecorated = this.onDecorated.bind(this);
    }

    onDecorated(terms: React.ReactNode) {
      this.terms = terms;
      // Don't forget to propagate it to HOC chain
      if (this.props.onDecorated) this.props.onDecorated(terms);
    }

    render() {
      return React.createElement(
        Terms,
        Object.assign({}, this.props, {
          onDecorated: this.onDecorated
        })
      );
      // Or if you use JSX:
      // <Terms onDecorated={this.onDecorated} />
    }
  }
}
