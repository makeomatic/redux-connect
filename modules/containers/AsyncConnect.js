import { connect } from 'react-redux';
import { AsyncConnect } from '../components/AsyncConnect';
import { beginGlobalLoad, endGlobalLoad } from '../store';

export default connect(null, { beginGlobalLoad, endGlobalLoad })(AsyncConnect);
