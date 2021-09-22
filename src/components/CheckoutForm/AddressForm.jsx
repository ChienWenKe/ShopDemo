import React, { useState, useEffect, useCallback } from 'react';
import { InputLabel, Select, MenuItem, Button, Grid, Typography } from '@material-ui/core';
import { useForm, FormProvider } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { commerce } from '../../lib/commerce';
import FormInput from './CustomTextField';


const useCountries = (checkoutToken) => {
  const [defaultCountry, setDefaultCountry] = useState('');
  const [shippingCountries, setShippingCountries] = useState([]);

  const countries = Object.entries(shippingCountries).map(([code, name]) => ({
    id: code,
    label: name,
  }));

  
  const fetchShippingCountries = useCallback(async (id) => {
    const { countries } = await commerce.services.localeListShippingCountries(
      id
    );
    setShippingCountries(countries);
    setDefaultCountry(Object.keys(countries)[0]);
  }, []);

  useEffect(() => {
    if (checkoutToken) {
      const { id } = checkoutToken;
      fetchShippingCountries(id);
    }
  }, [checkoutToken, fetchShippingCountries]);

  return [countries, defaultCountry];
};


const useSubdivisions = (shippingCountry) => {
  const [defaultSubdivision, setDefaultSubdivision] = useState('');
  const [shippingSubdivisions, setShippingSubdivisions] = useState([]);

  const subdivisions = Object.entries(shippingSubdivisions).map(
    ([code, name]) => ({
      id: code,
      label: name,
    })
  );

  const fetchSubdivisions = async (countryCode) => {
    const { subdivisions } = await commerce.services.localeListSubdivisions(
      countryCode
    );

    setShippingSubdivisions(subdivisions);
    setDefaultSubdivision(Object.keys(subdivisions)[0]);
  };

  useEffect(() => {
    if (shippingCountry) fetchSubdivisions(shippingCountry);
  }, [shippingCountry]);

  return [subdivisions, defaultSubdivision];
};

const renderList = (items) => {
  return items.map((item) => (
    <MenuItem key={item.id} value={item.id}>
      {item.label}
    </MenuItem>
  ));
};



const AddressForm = ({ checkoutToken, test }) => {
  const [countries, defaultCountry] = useCountries(checkoutToken);
  const [shippingCountry, setShippingCountry] = useState('');
  const [subdivisions, defaultSubdivision] =  useSubdivisions(shippingCountry);
  const [shippingSubdivision, setShippingSubdivision] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingOption, setShippingOption] = useState('');
  const methods = useForm();


  const fetchShippingOptions = async (checkoutTokenId, country, stateProvince = null) => {
    const options = await commerce.checkout.getShippingOptions(checkoutTokenId, { country, region: stateProvince });

    setShippingOptions(options);
    setShippingOption(options[0].id);
  };

  useEffect(() => {
    if (defaultCountry) {
      setShippingCountry(defaultCountry);
    }
  }, [defaultCountry]);

  useEffect(() => {
    if (defaultSubdivision) {
      setShippingSubdivision(defaultSubdivision);
    }
  }, [defaultSubdivision]);

  useEffect(() => {
    let tokenId;
    
    if (checkoutToken) {
      tokenId = checkoutToken.id;
      console.log(tokenId);
    }
  
  
    if (shippingSubdivision) fetchShippingOptions(tokenId, shippingCountry, shippingSubdivision);
  }, [checkoutToken, shippingCountry,shippingSubdivision]);

  return (
    <>
      <Typography variant="h6" gutterBottom>運送地址</Typography>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit((data) => test({ ...data, shippingCountry, shippingSubdivision }))}>
          <Grid container spacing={3}>
            <FormInput required name="名字" label="名字" />
            <FormInput required name="姓氏" label="姓氏" />
            <FormInput required name="聯絡電話" label="聯絡電話" />
            <FormInput required name="email" label="Email" />
            
            <Grid item xs={12} sm={6}>
              <InputLabel>運送國家</InputLabel>
              <Select value={shippingCountry} fullWidth onChange={(e) => {setShippingCountry(e.target.value);}}>
              {countries ? renderList(countries) : null}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputLabel>區域</InputLabel>
              <Select value={shippingSubdivision} fullWidth onChange={(e) => {setShippingSubdivision(e.target.value);}}>
              {subdivisions ? renderList(subdivisions) : null}

              </Select>
            </Grid>
            <FormInput required name="地址" label="地址" />
            <FormInput required name="郵遞區號" label="郵遞區號" />
            <Grid item xs={12} sm={6}>
              <InputLabel>運費選項</InputLabel>
              <Select value={shippingOption} fullWidth onChange={(e) => setShippingOption(e.target.value)}>
                {shippingOptions.map((sO) => ({ id: sO.id, label: `${sO.description} - (${sO.price.formatted_with_symbol})` })).map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
          <br />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button component={Link} variant="outlined" to="/cart">回到購物車</Button>
            <Button type="submit" variant="contained" color="primary">下一步</Button>
          </div>
        </form>
      </FormProvider>
    </>
  );
};

export default AddressForm;

