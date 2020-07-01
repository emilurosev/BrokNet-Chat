import React from 'react';
import Paper from '@material-ui/core/Paper'
import { Typography, Button } from '@material-ui/core';
import Container from '@material-ui/core/Container';

const firebase = require('firebase');

class MyProfile extends React.Component {

    constructor() {
        super();
        this.state = {
            email: "",
            photo: "",
            emailVerified: false,
            private: false,
            userInfo : []
        };
    }

    componentDidMount = async () => {
        firebase.auth().onAuthStateChanged(async _usr => {
            if(!_usr) {
                this.props.history.push('/login');
            }
            else {  
                this.setState({email: _usr.email, emailVerified: _usr.emailVerified, photo: _usr.photoURL});
            }
        });
        await firebase.firestore().collection('users').get()
            .then(querySnapshot => {
                querySnapshot.docs.forEach(doc => {
                    if(doc.data().email === this.state.email) {
                        this.setState({userInfo: doc.data()})
                    }
                });
        });
        console.log(this.state.userInfo);
        console.log(this.state.userInfo.private);
        console.log(this.state.userInfo.followRequests);

    }

    setProfileToPrivate = async() => {
        await firebase.firestore().collection('users').doc(this.state.userInfo.uid).update(
            {private: true}
        );
        window.location.reload();
    }

    setProfileToPublic = async() => {
        await firebase.firestore().collection('users').doc(this.state.userInfo.uid).update(
            {private: false}
        )
        window.location.reload();

    }

    acceptRequest = async(email) => {
        await firebase.firestore().collection('users').doc(this.state.userInfo.uid).update(
            {
                followRequests: firebase.firestore.FieldValue.arrayRemove(email),
                followers: firebase.firestore.FieldValue.arrayUnion(email)
            }
        )
        window.location.reload();
    }

    removeFollower = async(email) => {
        await firebase.firestore().collection('users').doc(this.state.userInfo.uid).update(
            {
                followers: firebase.firestore.FieldValue.arrayRemove(email)
            }
        );
        window.location.reload();
    }

    render() {
        return <div>
            <Container style={{textAlign: "center"}}>
                <Paper style={{marginTop: '2rem', padding: '1rem'}}>
                    <Typography variant='h2'>{this.state.email}</Typography>
                    {
                        this.state.emailVerified ?
                        <Typography color='primary' variant="body2">Email is verified!</Typography> :
                        <Typography color='error' variant='body2'>Email is NOT verified!</Typography>
                    }
                    <img style={{marginTop: '1rem'}} src={this.state.photo} alt='profile pic'></img>
                    <br></br>
                    {
                        this.state.userInfo.private ?
                        <Button variant='contained' color='secondary' onClick={this.setProfileToPublic}>Set to public</Button> :
                        <Button variant='contained' color='secondary' onClick={this.setProfileToPrivate}>Set to private</Button>
                    }
                    <br></br>
                    <p>Followers: </p>
                    { 
                        this.state.userInfo.followers !== undefined ?
                        this.state.userInfo.followers.map((item, index) => {
                            return <div><li key={index}>{item}</li><Button onClick={() => this.removeFollower(item)}>Remove</Button><br></br></div>
                        }) :
                        null       
                    }
                    <br></br>
                    <p>New requests: </p>
                    {  
                        this.state.userInfo.followRequests !== undefined ?
                        this.state.userInfo.followRequests.map((item, index) => {
                            return <div><li key={index}>{item}</li><Button onClick={() => this.acceptRequest(item)}>Accept</Button><br></br></div>
                        }) :
                        null
                    }
                    
                </Paper>
            </Container>
        </div>;
    }
}

export default MyProfile;