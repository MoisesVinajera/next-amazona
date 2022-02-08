import {
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useContext, useReducer, useState } from 'react';
import Layout from '../../../components/Layout';
import { Store } from '../../../utils/Store';
import NextLink from 'next/link';
import useStyles from '../../../utils/styles';
import { Controller, useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { getError } from '../../../utils/error';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST': {
      return { ...state, loading: true, error: '' };
    }
    case 'FETCH_SUCCESS': {
      return { ...state, loading: false, error: '' };
    }
    case 'FETCH_FAIL': {
      return { ...state, loading: false, error: action.payload };
    }
    case 'UPDATE_REQUEST': {
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    }
    case 'UPDATE_SUCCESS': {
      return { ...state, loadingUpdate: false, errorUpdate: '' };
    }
    case 'UPDATE_FAIL': {
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    }
    case 'UPLOAD_REQUEST': {
      return { ...state, loadingUpload: true, errorUpload: '' };
    }
    case 'UPLOAD_SUCCESS': {
      return { ...state, loadingUpload: false, errorUpload: '' };
    }
    case 'UPLOAD_FAIL': {
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    }
    default:
      state;
  }
};

const UserEdit = ({ params }) => {
  const userId = params.id;
  const classes = useStyles();
  const router = useRouter();
  const { state } = useContext(Store);
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    loadingUpdate: false,
    loadingUpload: false,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const { userInfo } = state;
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    } else {
      const fetchData = async () => {
        try {
          dispatch({ type: 'FETCH_REQUEST' });
          const { data } = await axios.get(`/api/admin/users/${userId}`, {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          });
          setIsAdmin(data.isAdmin);
          dispatch({ type: 'FETCH_SUCCESS' });
          setValue('name', data.name);
        } catch (err) {
          dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
        }
      };
      fetchData();
    }
  }, []);

  const submitHandler = async ({ name }) => {
    closeSnackbar();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/admin/users/${userId}`,
        {
          name,
          isAdmin,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      router.push('/admin/users');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };
  return (
    <Layout title={`Edit User ${userId}`}>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Admin Dashboard"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Orders"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/products" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Products"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/users" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Users"></ListItemText>
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Edit User {userId}
                </Typography>
              </ListItem>
              <ListItem>
                {loading && <CircularProgress />}
                {error && (
                  <Typography className={classes.error}>{error}</Typography>
                )}
              </ListItem>
              <ListItem>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className={classes.form}
                >
                  <List>
                    <ListItem>
                      <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="name"
                            label="Name"
                            error={Boolean(errors.name)}
                            helperText={errors.name ? 'Name is required' : ''}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        label="Is Admin"
                        control={
                          <Checkbox
                            onClick={(e) => setIsAdmin(e.target.checked)}
                            checked={isAdmin}
                            name="isAdmin"
                          ></Checkbox>
                        }
                      ></FormControlLabel>
                    </ListItem>

                    <ListItem>
                      <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        color="primary"
                      >
                        Update
                      </Button>
                      {loadingUpdate && <CircularProgress />}
                    </ListItem>
                  </List>
                </form>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};
export const getServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};
export default dynamic(() => Promise.resolve(UserEdit), { ssr: false });
