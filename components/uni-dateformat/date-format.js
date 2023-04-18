// yyyy-MM-dd hh:mm:ss.SSS 
function pad(str, length = 2) {
	str += ''
	while (str.length < length) {
		str = '0' + str
	}
	return str.slice(-length)
}

const parser = {
	yyyy: (dateObj) => {
		return pad(dateObj.year, 4)
	},
	yy: (dateObj) => {
		return pad(dateObj.year)
	},
	MM: (dateObj) => {
		return pad(dateObj.month)
	},
	M: (dateObj) => {
		return dateObj.month
	},
	dd: (dateObj) => {
		return pad(dateObj.day)
	},
	d: (dateObj) => {
		return dateObj.day
	},
	hh: (dateObj) => {
		return pad(dateObj.hour)
	},
	h: (dateObj) => {
		return dateObj.hour
	},
	mm: (dateObj) => {
		return pad(dateObj.minute)
	},
	m: (dateObj) => {
		return dateObj.minute
	},
	ss: (dateObj) => {
		return pad(dateObj.second)
	},
	s: (dateObj) => {
		return dateObj.second
	},
	SSS: (dateObj) => {
		return pad(dateObj.millisecond, 3)
	},
	S: (dateObj) => {
		return dateObj.millisecond
	},
}

// niOS2020-12-122020/12/12
function getDate(time) {
	if (time instanceof Date) {
		return time
	}
	switch (typeof time) {
		case 'string':
			{
				// 2020-12-12T12:12:12.000Z2020-12-12T12:12:12.000
				if (time.indexOf('T') > -1) {
					return new Date(time)
				}
				return new Date(time.replace(/-/g, '/'))
			}
		default:
			return new Date(time)
	}
}

export function formatDate(date, format = 'yyyy/MM/dd hh:mm:ss') {
	if (!date && date !== 0) {
		return ''
	}
	date = getDate(date)
	const dateObj = {
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
		hour: date.getHours(),
		minute: date.getMinutes(),
		second: date.getSeconds(),
		millisecond: date.getMilliseconds()
	}
	const tokenRegExp = /yyyy|yy|MM|M|dd|d|hh|h|mm|m|ss|s|SSS|SS|S/
	let flag = true
	let result = format
	while (flag) {
		flag = false
		result = result.replace(tokenRegExp, function(matched) {
			flag = true
			return parser[matched](dateObj)
		})
	}
	return result
}

export function friendlyDate(time, {
	locale = 'zh',
	threshold = [60000, 3600000],
	format = 'yyyy/MM/dd hh:mm:ss'
}) {
	if (!time && time !== 0) {
		return ''
	}
	const localeText = {
		zh: {
			year: '',
			month: '',
			day: '',
			hour: '',
			minute: '',
			second: '',
			ago: '',
			later: '',
			justNow: '',
			soon: '',
			template: '{num}{unit}{suffix}'
		},
		en: {
			year: 'year',
			month: 'month',
			day: 'day',
			hour: 'hour',
			minute: 'minute',
			second: 'second',
			ago: 'ago',
			later: 'later',
			justNow: 'just now',
			soon: 'soon',
			template: '{num} {unit} {suffix}'
		}
	}
	const text = localeText[locale] || localeText.zh
	let date = getDate(time)
	let ms = date.getTime() - Date.now()
	let absMs = Math.abs(ms)
	if (absMs < threshold[0]) {
		return ms < 0 ? text.justNow : text.soon
	}
	if (absMs >= threshold[1]) {
		return formatDate(date, format)
	}
	let num
	let unit
	let suffix = text.later
	if (ms < 0) {
		suffix = text.ago
		ms = -ms
	}
	const seconds = Math.floor((ms) / 1000)
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)
	const days = Math.floor(hours / 24)
	const months = Math.floor(days / 30)
	const years = Math.floor(months / 12)
	switch (true) {
		case years > 0:
			num = years
			unit = text.year
			break
		case months > 0:
			num = months
			unit = text.month
			break
		case days > 0:
			num = days
			unit = text.day
			break
		case hours > 0:
			num = hours
			unit = text.hour
			break
		case minutes > 0:
			num = minutes
			unit = text.minute
			break
		default:
			num = seconds
			unit = text.second
			break
	}

	if (locale === 'en') {
		if (num === 1) {
			num = 'a'
		} else {
			unit += 's'
		}
	}

	return text.template.replace(/{\s*num\s*}/g, num + '').replace(/{\s*unit\s*}/g, unit).replace(/{\s*suffix\s*}/g,
		suffix)
}
