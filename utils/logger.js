const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');
const format = require('date-fns/format')

const generateLogFileName = () => {
	const now = Date.now()
	const date = new Date(now);
	return format(date, "yyyy_MM_dd")+'_'+'access.logs';
}

const accessLogStream = rfs.createStream(generateLogFileName, {
	interval: '1d', // rotate daily
	path: path.join(__dirname, '..','logs')
})

module.exports ={ accessLogStream };