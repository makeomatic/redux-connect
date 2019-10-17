import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import AsyncConnectWithContext from '../components/AsyncConnect';
import { beginGlobalLoad, endGlobalLoad } from '../store';

export default connect(null, {
  beginGlobalLoad,
  endGlobalLoad,
})(withRouter(AsyncConnectWithContext));
