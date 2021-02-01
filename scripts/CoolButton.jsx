

import * as React from 'react';
import { Socket } from './Socket';

import { AwesomeButton } from 'react-awesome-button';

class CoolButton extends AwesomeButton
{
	render()
	{
		return <CoolButton type="anchor" />;
	}
}

export default CoolButton;
