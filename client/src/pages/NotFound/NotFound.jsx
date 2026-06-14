import './NotFound.scss';

const NotFound = () => {
  return (
    <div className='notFound'>
      <div className='container'>
        <h1>404</h1>
        <div className='text'>
          <h2>Страница не найдена</h2>
          <p>Извините, не нашлась страница, которую вы просматриваете</p>
        </div>
      </div>
    </div>
  )
}

export default NotFound;