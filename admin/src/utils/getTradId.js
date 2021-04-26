import getTrad from './getTrad';

const getTradId = (id) => ({ id: getTrad(id) });

export default getTradId;
