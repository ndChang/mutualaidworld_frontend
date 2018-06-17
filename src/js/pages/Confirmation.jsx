/*** IMPORTS ***/
// Module imports
import React, { Component } from "react"
import Cookies from "js-cookie"

// Page wrapper
import Page from "./Page"

// Page elements
import StarRating from "../components/StarRating"
import Submit from "../components/inputs/Submit"

// Local JS Utilities
import Database from "../resources/Database"
import { getBase64, toFirstCap } from "../resources/Util"

// Image
import stubImage from "../../img/stub-image.png"
import genericAvatar from "../../img/fb-profile.jpg"
/*** [end of imports] ***/

export default class Confirmation extends Component {
  state = {
    scenarioId: null,
    scenarioData: null,
    parentScenarioId: this.props.match.params.scenario_id || "1",
    parentScenarioData: null,
    role: this.props.match.params.role || "doer",
    verb: this.props.match.params.verb || "fix",
    noun: this.props.match.params.noun || "roof",
    currentUser: Cookies.get("userId") || "1",
    ratingColapsed: true
  }

  componentDidMount = () => {
    Database.getScenarioWithChildren({ id: this.state.parentScenarioId })
      .then(result => {
        const { data } = result.body.data.relationships.children_scenario
        let idList = []

        this.setState({
          parentScenarioData: result.body.data
        })

        for (let i in data) {
          idList.push(data[i].id)
        }

        this.setChildrenScenarioData(idList)
      })
      .catch(error => {
        this.setState({
          scenarioData: null
        })
      })
  }

  setChildrenScenarioData = list => {
    for (let i = 0, l = list.length; i < l; i++) {
      Database.getScenarioWithVouches({ id: list[i] })
        .then(result => {
          const { data } = result.body
          const { noun, verb } = data.attributes

          if (noun === this.state.noun && verb === this.state.verb) {
            this.setState({
              scenarioData: data,
              scenarioId: list[i]
            })
          }
        })
        .catch(error => {})
    }
  }

  submitConfirmation = params => {
    const { scenarioId, parentScenarioId, currentUser, role } = this.state
    const imageString = getBase64(params.image)

    const json = {
      data: {
        type: "vouches",
        attributes: {
          image: imageString || "",
          description: params.description || "",
          rating: params.rating || ""
        },
        relationships: {
          scenario: {
            data: {
              type: "scenarios",
              id: scenarioId || parentScenarioId
            }
          },
          verifier: {
            data: {
              type: "users",
              id: currentUser
            }
          }
        }
      }
    }

    Database.createVouch(json)
      .then(result => {
        this.props.history.push(`/${parentScenarioId}/${role}`)
      })
      .catch(error => {})
  }

  openRating = () => {
    this.setState({
      ratingColapsed: false
    })
  }

  render() {
    const { role, parentScenarioData, ratingColapsed } = this.state

    let buttonObj = {
      labelPhrase: "Verify mission complete",
      clas: "footer-btn feed-btn",
      onSubmit: this.submitConfirmation,
      onSubmitParams: {
        rating: "rating"
      }
    }

    const footer = <Submit {...buttonObj} />

    return (
      <Page className={`confirmation-page ${role}-confirmation-page`} footer={footer}>
        <header className="confirmation-header">
          {parentScenarioData && (
            <h4 className="scenario-title">{`${toFirstCap(parentScenarioData.attributes.verb)} ${toFirstCap(
              parentScenarioData.attributes.requester_firstname
            )}'s ${parentScenarioData.attributes.noun}`}</h4>
          )}
        </header>

        <section className="confirmation-body">
          <header className="job-status-header">
            <span className="job-status-label">Job Status: </span>
            <span className="job-status">All tasks completed</span>
          </header>

          <div className="message-box">
            <div className="message-user-wrap">
              <div
                className="message-box-avatar"
                style={{
                  backgroundImage: `url("${genericAvatar}")`
                }}
              />
            </div>
            <div className="message-bubble-wrap">
              <div className="bubble">
                <div className="vouch-image-wrap">
                  <img className="vouch-image" src={stubImage} alt="Proof" />
                </div>
                <div className="vouch-message">
                  <p>Hi Audrey,</p>
                  <p>
                    Your roof is fixed. You shouldn't have any problems with leaks now. Good luck with everything and
                    thanks for the delicious meals you gave us while we were working.
                  </p>
                  <p>John</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={ratingColapsed ? "rating-wrapper" : "rating-wrapper open"}>
            <button className="rating-opener" onClick={() => this.openRating()}>Rate Mission</button>
            <StarRating headerLabel="How well was it completed?" />
          </div>
        </section>
      </Page>
    )
  }
}
