import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'

// icons
import UsersIcon from '@material-ui/icons/People'
import BrowseIcon from '@material-ui/icons/ImportContacts'
import SearchIcon from '@material-ui/icons/Search'
import ContactIcon from '@material-ui/icons/ContactMail'
import AboutIcon from '@material-ui/icons/FormatShapes'

import { Link } from 'react-router-dom'

// components
import LoggedInUser from './LoggedInUser'

const AboutLink = props => <Link to='/about' {...props} />
const ContactLink = props => <Link to='/contact' {...props} />
const SearchLink = props => <Link to='/search' {...props} />
const BrowseLink = props => <Link to='/browse' {...props} />
const HomeLink = props => <Link to='/' {...props} />

const styles = {
  root: {
    flexGrow: 1
  },
  flex: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  img: {
    margin: 20,
    display: 'block',
    maxWidth: 240,
    maxHeight: 48
  }
}

class NavBar extends Component {

  constructor (props) {
    super(props)
    this.state = {
      authId: null
    }
  }

  componentDidMount () {
    let user = localStorage.getItem('user')
    let authId

    if (user !== null && user !== undefined && user !== 'undefined') {
      user = JSON.parse(user)
      authId = user.authId
    }

    if (authId !== null && authId !== undefined && authId !== 'undefined') {
      this.setState({ authId: authId })
    }
  }
  render () {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <AppBar position='static'>
          <Toolbar>
            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='Home'
              component={HomeLink}>
              <UsersIcon />
            </IconButton>
            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='Browse the Users Directory'
              component={BrowseLink}>
              <BrowseIcon />
            </IconButton>
            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='Search Users'
              component={SearchLink}>
              <SearchIcon />
            </IconButton>
            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='Contact Form'
              component={ContactLink}>
              <ContactIcon />
            </IconButton>
            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='About this Module'
              component={AboutLink}>
              <AboutIcon />
            </IconButton>
            <LoggedInUser authId={this.state.authId} />
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

NavBar.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(NavBar)
