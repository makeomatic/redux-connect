import AsyncConnect from '../components/AsyncConnect';
import { connect } from 'react-redux';
import { beginGlobalLoad, endGlobalLoad } from '../store';

export default connect(null, { beginGlobalLoad, endGlobalLoad })(AsyncConnect);
