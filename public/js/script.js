
const bannerSubtitle = document.querySelector('.banner-subtitle');

window.onload = () => {
	const bannerArray = [ 'be smart', 'be healthy', 'be nuts', 'be kind' ];
	let index = 0;

	setInterval(() => {

		bannerSubtitle.innerText = bannerArray[index++];

		if(index === bannerArray.length){
			index = 0;
		}

	}, 2500);

}


