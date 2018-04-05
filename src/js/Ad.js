/*** IMPORTS ***/
// Module imports
import React, { Component } from "react"
import Icon from "@fortawesome/react-fontawesome"
/*** [end of imports] ***/

export default class Ad extends Component {
	constructor(props) {
		super(props)

		this.state = {
			xTransform: 0,
			touchStartX: 0,
			lastTouchX: 0,
			style: { transform: `translateX(0) scale(1)` },
			beforeStyle: { opacity: 0 },
			afterStyle: { opacity: 0 },
			threshold: 150,
			transitionTiming: 100
		}

		this.handleTouchStart = this.handleTouchStart.bind(this)
		this.handleTouchMove = this.handleTouchMove.bind(this)
		this.handleTouchEnd = this.handleTouchEnd.bind(this)
	}

	handleTouchStart = e => {
		this.setState({
			touchStartX: e.targetTouches[0].clientX,
			style: {
				transform: `translateX(0) scale(1.05)`,
				zIndex: 10
			}
		})
	}
	handleTouchMove = e => {
		let { touchStartX } = this.state
		let currentTouchX = e.targetTouches[0].clientX
		let xDif = currentTouchX - touchStartX

		if (xDif > 0) {
			this.setState({
				xTransform: xDif,
				lastTouchX: currentTouchX,
				style: {
					transform: `translateX(${xDif}px) scale(1.05)`
				},
				beforeStyle: {
					opacity: 1
				},
				afterStyle: {
					opacity: 0
				}
			})
		} else {
			this.setState({
				xTransform: xDif,
				lastTouchX: currentTouchX,
				style: {
					transform: `translateX(${xDif}px) scale(1.05)`
				},
				beforeStyle: {
					opacity: 0
				},
				afterStyle: {
					opacity: 1
				}
			})
		}
	}
	handleTouchEnd = e => {
		let { touchStartX, lastTouchX, threshold, transitionTiming } = this.state

		let {
			scenario,
			// dismissAd,
			lastUrlSegment
		} = this.props

		let xDif = lastTouchX === 0 ? 0 : lastTouchX - touchStartX

		if (Math.abs(xDif) > threshold) {
			if (touchStartX < lastTouchX) {
				this.setState({
					style: {
						transform: "translateX(100%) scale(1)",
						marginBottom: "-15rem" // Currently this is an approximation of the element height
					},
					beforeStyle: { opacity: 0 },
					afterStyle: { opacity: 0 }
				})
				setTimeout(() => {
					window.location = `/${scenario.id}/${lastUrlSegment}/`
				}, transitionTiming)
			} else {
				this.setState({
					style: {
						transform: "translateX(-100%) scale(1)",
						marginBottom: "-15rem" // Currently this is an approximation of the element height
					},
					beforeStyle: { opacity: 0 },
					afterStyle: { opacity: 0 }
				})
				// return dismissAd(id)
			}
		} else {
			this.setState({
				style: {
					transform: `translateX(0) scale(1)`,
					zIndex: 10
				},
				beforeStyle: { opacity: 0 },
				afterStyle: { opacity: 0 }
			})
		}
	}

	titleBuild = () => {
		let { lastUrlSegment } = this.props
		let {
			requester_firstname,
			donated,
			noun,
			verb
		} = this.props.scenario.attributes

		if (lastUrlSegment === "donator") {
			return (
				<header className="ad-header">
					<h4 className="ad-title">
						{<span>{`Help us fund ${toFirstCap(requester_firstname)}`}</span>}
					</h4>
					<h5 className="ad-subtitle">
						{<span>{`${donated} funded so far`}</span>}
					</h5>
				</header>
			)
		} else if (lastUrlSegment === "doer") {
			return (
				<header className="ad-header">
					<h4 className="ad-title">
						<span>{`Can you ${verb} ${noun} for ${toFirstCap(
							requester_firstname
						)}?`}</span>
					</h4>
					<h5 className="ad-subtitle">
						<span>{`${donated} funded`}</span>
					</h5>
				</header>
			)
		} else if (lastUrlSegment === "requester") {
			return (
				<header className="ad-header">
					<h4 className="ad-title">
						<span>{`Need ${noun}?`}</span>
					</h4>
					<h5 className="ad-subtitle">
						<span>30 individuals helped this month</span>
					</h5>
				</header>
			)
		} else if (lastUrlSegment === "verifier") {
			return (
				<header className="ad-header">
					<h4 className="ad-title">
						<span>{`Know ${toFirstCap(requester_firstname)}?`}</span>
					</h4>
					<h5 className="ad-subtitle">
						<span>Help us identify them on Facebook</span>
					</h5>
				</header>
			)
		}
	}
	callToActionBuild = requestType => {
		if (requestType === "doer") return <span>Help today</span>
		else if (requestType === "donator") return <span>Donate now</span>
		else if (requestType === "verifier") return <span>Verify user</span>
		else if (requestType === "requester") return <span>Get Help</span>
	}

	render() {
		let { style, beforeStyle, afterStyle } = this.state
		let { scenario, lastUrlSegment } = this.props

		let {
			// doer_firstname,
			// doer_lastname,
			// requester_firstname,
			// requester_lastname,
			// funding_goal,
			disaster,
			// doerlat,
			// doerlon,
			// requestorlat,
			// requestorlon,
			// donated,
			image
			// imagethumb,
			// noun,
			// verb
		} = scenario.attributes

		return (
			<article
				className={`ad ${lastUrlSegment}-ad`}
				id={`scenario_${scenario.id}`}
				style={style}
				onTouchStart={e => this.handleTouchStart(e)}
				onTouchMove={e => this.handleTouchMove(e)}
				onTouchEnd={e => this.handleTouchEnd(e)}
			>
				<div className="pseudo-before" style={beforeStyle}>
					<p>Accept</p>
					<Icon icon="thumbs-up" />
				</div>
				<div className="pseudo-after" style={afterStyle}>
					<p>Dismiss</p>
					<Icon icon="ban" />
				</div>
				<figure className="ad-image-wrap">
					<img src={image} alt={disaster} className="ad-image" />
					<p className="ad-image-caption">{disaster}</p>
				</figure>
				{this.titleBuild()}
				<a
					className="btn ad-modal-btn"
					href={`/${scenario.id}/${lastUrlSegment}/`}
				>
					{this.callToActionBuild(lastUrlSegment)}
				</a>
			</article>
		)
	}
}

const toFirstCap = str => str.charAt(0).toUpperCase() + str.slice(1)
