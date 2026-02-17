import React from 'react';

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null, loading: true };
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.fetchUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser();
    }
  }

  componentWillUnmount() {
    this.cancelled = true;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.userId !== this.props.userId || nextState.user !== this.state.user;
  }

  fetchUser() {
    fetch(`/api/users/${this.props.userId}`)
      .then(res => res.json())
      .then(user => {
        if (!this.cancelled) {
          this.setState({ user, loading: false });
        }
      });
  }

  render() {
    if (this.state.loading) return <div>Loading...</div>;
    return (
      <div>
        <h1>{this.state.user.name}</h1>
        <input ref={this.inputRef} />
        <p>Email: {this.props.email}</p>
      </div>
    );
  }
}

export default UserProfile;
