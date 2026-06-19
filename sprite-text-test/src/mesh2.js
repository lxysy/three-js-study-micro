import SpriteText from "three-spritetext";

const spriteText = new SpriteText('a\naa测试\na', 300);

spriteText.padding = 80;
spriteText.strokeWidth = 2;
spriteText.strokeColor = 'blue';

spriteText.borderColor = '#ffffff';
spriteText.borderWidth = 10;
spriteText.borderRadius = 100;
spriteText.backgroundColor = 'lightpink';



export default spriteText;
