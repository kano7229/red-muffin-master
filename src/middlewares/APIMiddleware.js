import * as ActionTypes from '../constants/ActionTypes'
import * as RedmineAPI from '../api/RedmineAPI'
import * as Actions from '../actions'

const APIMiddleware = ({dispatch, getState}) => next => action => {

  if (action.type === ActionTypes.GET_GROUPS) {
    RedmineAPI.getGroups()
      .then(groups => dispatch(Actions.setGroups(groups)))
    console.log("g");
  }

  if (action.type === ActionTypes.GET_YEARS) {
    RedmineAPI.getProjects()
      .then(_projects => {
        let years = []
        const projects = _projects.map(project => {
          // console.log(project.custom_fields[0].value)
          if(years.indexOf(project.custom_fields[0].value) == -1){
            years.push(project.custom_fields[0].value)
          }
        })
        return years
      })
      .then(years => years.sort((a, b) => {return a > b ? 1 : -1}))
      .then(years => dispatch(Actions.setYears(years)))
    console.log("p");
  }

  if (action.type === ActionTypes.GET_PROJECTS) {
    const selected_group_id = getState().reducers.selected_group_id
    const selected_year = getState().reducers.selected_year
    console.log("action");
    RedmineAPI.getProjects()
      .then(_projects => {
        let selected_project_id = []
        const projects = _projects.map(project => {
          if(project.identifier == selected_group_id && project.custom_fields[0].value == selected_year){
            selected_project_id.push(project.id)
          }
        })
        return selected_project_id
      })
      .then(projects => dispatch(Actions.setProjects(projects)))
      // .then(() => dispatch(Actions.getIssueRows()))
  }

  if (action.type === ActionTypes.GET_ISSUE_ROWS) {
    const selected_project_id = getState().reducers.selected_project_id
    RedmineAPI.getIssues()
      .then(_issues => {
        console.log(_issues)
        return _issues.filter(issue => (issue.project.id == selected_project_id))
          .map(issue => {
            return {
              id: issue.id,
              ankenno: issue.custom_fields[0].value,
              naibukanrino: issue.custom_fields[1].value,
              title: issue.subject,
              assigned: issue.assigned_to.name,
              estimate: 10,
              hide: issue.custom_fields[26].value
            }
          })
      })
      // .then(json => console.log(json))
      .then(issue_rows => dispatch(Actions.setIssueRows(issue_rows)))
  }

  next(action)
}

export default APIMiddleware
