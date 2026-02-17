import React from 'react';

class Counter extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.resetCount) {
      return { count: 0 };
    }
    return null;
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}

export default Counter;
