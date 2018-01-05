import { connect } from 'react-redux';
import withRouter from 'react-router/withRouter';
import { AsyncConnect } from '../components/AsyncConnect';
import { beginGlobalLoad, endGlobalLoad } from '../store';

export default withRouter(connect(null, { beginGlobalLoad, endGlobalLoad })(AsyncConnect));
