'use strict'

const fs = require('fs')
const path = require('path')
const parse5 = require('parse5')
const lodash = require('lodash')
const { optimize } = require('svgo')
const { red, green, blue, cyan, bold } = require('kolorist')

const plugin_name = 'html-inline-svg'
const default_options = {
	svgo: {
		plugins: ['removeComments']
	}
}

const isNodeValidInlineImage = node => {
	if (node.nodeName !== 'img') return false
	return lodash.filter(node.attrs, { name: 'inline' }).length
}

const getImagesSrc = node => {
	const src = lodash.find(node.attrs, { name: 'src' })
	if (!src) return ''

	const value = src.value
	return value && value.indexOf('.svg') !== -1 ? value : ''
}

const getInlineImages = (fragment, buffer) => {
	if (!buffer) buffer = []

	if (fragment.childNodes && fragment.childNodes.length) {
		fragment.childNodes.forEach((childNode) => {
			if (isNodeValidInlineImage(childNode)) {
				buffer.push(childNode)
			} 
			else {
				buffer = getInlineImages(childNode, buffer)
			}
		})
	}

	return buffer
}

const processInlineImage = (html, options) => {
	
	const fragment = parse5.parseFragment(html, {
		sourceCodeLocationInfo: true,
	})
	const image = getInlineImages(fragment)[0]

	if (!image) return Promise.resolve(html)

	return new Promise((resolve, reject) => {
		const src = getImagesSrc(image)
		const filepath = path.resolve(src)
        console.info(`${cyan(plugin_name)}\tprocess: ${filepath}`)

		fs.readFile(filepath, 'utf8', (err, data) => {
			if (err) return reject(err)
			
			const result = optimize(data, options.svgo)
			const optimised = result.data
			html = replaceImageWithSVG(html, image, optimised)
	  
			resolve(html)
		})
	})
}

const replaceImageWithSVG = (html, image, svg) => {
	
	const attrs = image.attrs.reduce((acc, attr) => {
		const { name, value } = attr
		return name !== 'inline'
			&& name !== 'src'
			? acc + `${name}="${value}" `
			: acc
	}, '')

	if (attrs) {
		svg = svg.replace('<svg', `<svg ${attrs}`)
	}

	const start = image.sourceCodeLocation.startOffset
	const end = image.sourceCodeLocation.endOffset

	return html.substring(0, start) + svg + html.substring(end)
}

const htmlInlineSvg = options => {
	const _options = { ...default_options, ...options }
	return {
		name: plugin_name,
		transformIndexHtml(html) {
			const fragment = parse5.parseFragment(html, {
                sourceCodeLocationInfo: true
            })
			const images = getInlineImages(fragment)

			console.info(`\n${cyan(plugin_name)}\tinline images: ${images.length}`)

			return images.reduce((promise, imageNode) => 
				promise.then(html => 
					processInlineImage(html, _options)
				)
				.catch(err => console.error(`${bold(red('Error'))}: ${cyan(plugin_name)}`, err))
			, Promise.resolve(html))
		}
	}
}

module.exports = htmlInlineSvg
module.exports.default = module.exports