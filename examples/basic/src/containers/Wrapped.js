import Promise from 'bluebird';
import { asyncConnect } from '../../../../';
import Wrapped from '../components/Wrapped';

export default asyncConnect([{
  key: 'lunch',
  promise: () => Promise.delay(500, 'borsch'),
}])(Wrapped);
