import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import { AuthUserContext } from '../Session';

const styles = {
    root: {
          flexGrow: 1,
    },
    grow: {
          flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
};

class Navigation extends React.Component {

    state = {
        anchorEl: null,
    };
    
    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };
    
    handleClose = () => {
        this.setState({ anchorEl: null });
    };
    
    render() {
        const { classes } = this.props;
        const { anchorEl } = this.state;

        const MenuItemLink = (props) => (
            <MenuItem component={ Link } to={props.to} onClick={this.handleClose}>{props.text}</MenuItem>
        );

        const SignIn = () => (
            <Button color="inherit" component={ Link } to={ROUTES.SIGN_IN}>   
                Sign in
            </Button>
        );
        
        const NavigationAuth = () => (
            <div>
                <MenuItemLink to={ROUTES.LANDING} text="Landing" />
                <MenuItemLink to={ROUTES.DASHBOARD} text="Dashboard" />
                <MenuItemLink to={ROUTES.ACCOUNT} text="Account" />
                <MenuItemLink to={ROUTES.ADMIN} text="Admin" />
            </div>
        );
        
        const NavigationNonAuth = () => (
            <div>
                <MenuItemLink to={ROUTES.LANDING} text="Landing" />
            </div>
        );

        return (

            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton 
                            className={classes.menuButton} 
                            color="inherit" 
                            aria-label="Menu" 
                            aria-owns={anchorEl ? 'simple-menu' : undefined}
                            aria-haspopup="true"
                            onClick={this.handleClick}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={this.handleClose}
                        >
                            <AuthUserContext.Consumer>
                                {authUser =>
                                    authUser ? <NavigationAuth /> : <NavigationNonAuth />
                                }
                            </AuthUserContext.Consumer>
                        </Menu>
                        
                        <Typography variant="h6" color="inherit" className={classes.grow}>
                            Midas Brewing
                        </Typography>

                        <AuthUserContext.Consumer>
                            {authUser =>
                                authUser ? <SignOutButton /> : <SignIn />
                            }                                
                        </AuthUserContext.Consumer>

                    </Toolbar>
                </AppBar>
            </div>
        )
    }
}

Navigation.propTypes = {
    classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Navigation);